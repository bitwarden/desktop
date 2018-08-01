import { CipherType } from 'jslib/enums';

import { CipherView } from 'jslib/models/view/cipherView';
import { LoginUriView } from 'jslib/models/view/loginUriView';
import { LoginView } from 'jslib/models/view/loginView';

import { ConstantsService } from 'jslib/services/constants.service';

import { I18nService } from 'jslib/abstractions/i18n.service';

import { Analytics } from 'jslib/misc';

import {
    CipherService,
    StorageService,
} from 'jslib/abstractions';

import { BrowserApi } from '../browser/browserApi';

import MainBackground from './main.background';

import { AutofillService } from '../services/abstractions/autofill.service';
import BrowserPlatformUtilsService from '../services/browserPlatformUtils.service';

import { Utils } from 'jslib/misc/utils';

export default class RuntimeBackground {
    private runtime: any;
    private autofillTimeout: any;
    private pageDetailsToAutoFill: any[] = [];
    private isSafari: boolean;
    private onInstalledReason: string = null;

    constructor(private main: MainBackground, private autofillService: AutofillService,
        private cipherService: CipherService, private platformUtilsService: BrowserPlatformUtilsService,
        private storageService: StorageService, private i18nService: I18nService, private analytics: Analytics) {
        this.isSafari = this.platformUtilsService.isSafari();
        this.runtime = this.isSafari ? safari.application : chrome.runtime;

        // onInstalled listener must be wired up before anything else, so we do it in the ctor
        if (!this.isSafari) {
            this.runtime.onInstalled.addListener((details: any) => {
                this.onInstalledReason = details.reason;
            });
        }
    }

    async init() {
        if (!this.runtime) {
            return;
        }

        if (this.isSafari) {
            // Reload the popup when it's opened
            this.runtime.addEventListener('popover', (event: any) => {
                const win: Window = event.target.contentWindow;
                let href = win.location.href;
                if (href.indexOf('#') > -1) {
                    href = href.substr(0, href.indexOf('#'));
                }

                if (win.location.toString() === href) {
                    win.location.reload();
                } else {
                    win.location.href = href;
                }
            }, true);
        }

        await this.checkOnInstalled();

        BrowserApi.messageListener(async (msg: any, sender: any, sendResponse: any) => {
            await this.processMessage(msg, sender, sendResponse);
        });
    }

    async processMessage(msg: any, sender: any, sendResponse: any) {
        switch (msg.command) {
            case 'loggedIn':
            case 'unlocked':
            case 'locked':
                await this.main.setIcon();
                await this.main.refreshBadgeAndMenu(msg.command === 'locked');
                break;
            case 'logout':
                await this.main.logout(msg.expired);
                break;
            case 'syncCompleted':
                if (msg.successfully) {
                    setTimeout(async () => await this.main.refreshBadgeAndMenu(), 2000);
                }
                break;
            case 'openPopup':
                await this.main.openPopup();
                break;
            case 'showDialogResolve':
                this.platformUtilsService.resolveDialogPromise(msg.dialogId, msg.confirmed);
                break;
            case 'bgGetDataForTab':
                await this.getDataForTab(sender.tab, msg.responseCommand);
                break;
            case 'bgOpenNotificationBar':
                await BrowserApi.tabSendMessageData(sender.tab, 'openNotificationBar', msg.data);
                break;
            case 'bgCloseNotificationBar':
                await BrowserApi.tabSendMessageData(sender.tab, 'closeNotificationBar');
                break;
            case 'bgAdjustNotificationBar':
                await BrowserApi.tabSendMessageData(sender.tab, 'adjustNotificationBar', msg.data);
                break;
            case 'bgCollectPageDetails':
                this.main.collectPageDetailsForContentScript(sender.tab, msg.sender, sender.frameId);
                break;
            case 'bgAddLogin':
                await this.addLogin(msg.login, sender.tab);
                break;
            case 'bgChangedPassword':
                await this.changedPassword(msg.data, sender.tab);
                break;
            case 'bgAddClose':
            case 'bgChangeClose':
                this.removeTabFromNotificationQueue(sender.tab);
                break;
            case 'bgAddSave':
                await this.saveAddLogin(sender.tab);
                break;
            case 'bgChangeSave':
                await this.saveChangePassword(sender.tab);
                break;
            case 'bgNeverSave':
                await this.saveNever(sender.tab);
                break;
            case 'bgUpdateContextMenu':
                await this.main.refreshBadgeAndMenu();
                break;
            case 'collectPageDetailsResponse':
                switch (msg.sender) {
                    case 'notificationBar':
                        const forms = this.autofillService.getFormsWithPasswordFields(msg.details);
                        await BrowserApi.tabSendMessageData(msg.tab, 'notificationBarPageDetails', {
                            details: msg.details,
                            forms: forms,
                        });
                        break;
                    case 'autofiller':
                    case 'autofill_cmd':
                        const totpCode = await this.autofillService.doAutoFillForLastUsedLogin([{
                            frameId: sender.frameId,
                            tab: msg.tab,
                            details: msg.details,
                        }], msg.sender === 'autofill_cmd');

                        if (totpCode !== null && !this.platformUtilsService.isFirefox()) {
                            this.platformUtilsService.copyToClipboard(totpCode);
                        }
                        break;
                    case 'contextMenu':
                        clearTimeout(this.autofillTimeout);
                        this.pageDetailsToAutoFill.push({
                            frameId: sender.frameId,
                            tab: msg.tab,
                            details: msg.details,
                        });
                        this.autofillTimeout = setTimeout(async () => await this.autofillPage(), 300);
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }

    private async autofillPage() {
        const totpCode = await this.autofillService.doAutoFill({
            cipher: this.main.loginToAutoFill,
            pageDetails: this.pageDetailsToAutoFill,
        });

        if (totpCode !== null && !this.platformUtilsService.isFirefox()) {
            this.platformUtilsService.copyToClipboard(totpCode);
        }

        // reset
        this.main.loginToAutoFill = null;
        this.pageDetailsToAutoFill = [];
    }

    private async saveAddLogin(tab: any) {
        for (let i = this.main.notificationQueue.length - 1; i >= 0; i--) {
            const queueMessage = this.main.notificationQueue[i];
            if (queueMessage.tabId !== tab.id || queueMessage.type !== 'addLogin') {
                continue;
            }

            const tabDomain = this.platformUtilsService.getDomain(tab.url);
            if (tabDomain != null && tabDomain !== queueMessage.domain) {
                continue;
            }

            this.main.notificationQueue.splice(i, 1);

            const loginModel = new LoginView();
            const loginUri = new LoginUriView();
            loginUri.uri = queueMessage.uri;
            loginModel.uris = [loginUri];
            loginModel.username = queueMessage.username;
            loginModel.password = queueMessage.password;
            const model = new CipherView();
            model.name = Utils.getHostname(queueMessage.uri) || queueMessage.domain;
            model.type = CipherType.Login;
            model.login = loginModel;

            const cipher = await this.cipherService.encrypt(model);
            await this.cipherService.saveWithServer(cipher);
            this.analytics.ga('send', {
                hitType: 'event',
                eventAction: 'Added Login from Notification Bar',
            });

            BrowserApi.tabSendMessageData(tab, 'closeNotificationBar');
        }
    }

    private async saveChangePassword(tab: any) {
        for (let i = this.main.notificationQueue.length - 1; i >= 0; i--) {
            const queueMessage = this.main.notificationQueue[i];
            if (queueMessage.tabId !== tab.id || queueMessage.type !== 'changePassword') {
                continue;
            }

            const tabDomain = this.platformUtilsService.getDomain(tab.url);
            if (tabDomain != null && tabDomain !== queueMessage.domain) {
                continue;
            }

            this.main.notificationQueue.splice(i, 1);

            const cipher = await this.cipherService.get(queueMessage.cipherId);
            if (cipher != null && cipher.type === CipherType.Login) {
                const model = await cipher.decrypt();
                model.login.password = queueMessage.newPassword;
                const newCipher = await this.cipherService.encrypt(model);
                await this.cipherService.saveWithServer(newCipher);
                this.analytics.ga('send', {
                    hitType: 'event',
                    eventAction: 'Changed Password from Notification Bar',
                });
            }

            BrowserApi.tabSendMessageData(tab, 'closeNotificationBar');
        }
    }

    private async saveNever(tab: any) {
        for (let i = this.main.notificationQueue.length - 1; i >= 0; i--) {
            const queueMessage = this.main.notificationQueue[i];
            if (queueMessage.tabId !== tab.id || queueMessage.type !== 'addLogin') {
                continue;
            }

            const tabDomain = this.platformUtilsService.getDomain(tab.url);
            if (tabDomain != null && tabDomain !== queueMessage.domain) {
                continue;
            }

            this.main.notificationQueue.splice(i, 1);
            const hostname = Utils.getHostname(tab.url);
            await this.cipherService.saveNeverDomain(hostname);
            BrowserApi.tabSendMessageData(tab, 'closeNotificationBar');
        }
    }

    private async addLogin(loginInfo: any, tab: any) {
        const loginDomain = this.platformUtilsService.getDomain(loginInfo.url);
        if (loginDomain == null) {
            return;
        }

        const ciphers = await this.cipherService.getAllDecryptedForUrl(loginInfo.url);
        let match = false;
        for (let i = 0; i < ciphers.length; i++) {
            if (ciphers[i].login.username === loginInfo.username) {
                match = true;
                break;
            }
        }

        if (!match) {
            // remove any old messages for this tab
            this.removeTabFromNotificationQueue(tab);
            this.main.notificationQueue.push({
                type: 'addLogin',
                username: loginInfo.username,
                password: loginInfo.password,
                domain: loginDomain,
                uri: loginInfo.url,
                tabId: tab.id,
                expires: new Date((new Date()).getTime() + 30 * 60000), // 30 minutes
            });
            await this.main.checkNotificationQueue(tab);
        }
    }

    private async changedPassword(changeData: any, tab: any) {
        const loginDomain = this.platformUtilsService.getDomain(changeData.url);
        if (loginDomain == null) {
            return;
        }

        const ciphers = await this.cipherService.getAllDecryptedForUrl(changeData.url);
        const matches = ciphers.filter((c) => c.login.password === changeData.currentPassword);
        if (matches.length === 1) {
            // remove any old messages for this tab
            this.removeTabFromNotificationQueue(tab);
            this.main.notificationQueue.push({
                type: 'changePassword',
                cipherId: matches[0].id,
                newPassword: changeData.newPassword,
                domain: loginDomain,
                tabId: tab.id,
                expires: new Date((new Date()).getTime() + 30 * 60000), // 30 minutes
            });
            await this.main.checkNotificationQueue(tab);
        }
    }

    private removeTabFromNotificationQueue(tab: any) {
        for (let i = this.main.notificationQueue.length - 1; i >= 0; i--) {
            if (this.main.notificationQueue[i].tabId === tab.id) {
                this.main.notificationQueue.splice(i, 1);
            }
        }
    }

    private async checkOnInstalled() {
        if (this.isSafari) {
            const installedVersion = await this.storageService.get<string>(ConstantsService.installedVersionKey);
            if (installedVersion == null) {
                this.onInstalledReason = 'install';
            } else if (BrowserApi.getApplicationVersion() !== installedVersion) {
                this.onInstalledReason = 'update';
            }

            if (this.onInstalledReason != null) {
                await this.storageService.save(ConstantsService.installedVersionKey,
                    BrowserApi.getApplicationVersion());
            }
        }

        setTimeout(async () => {
            if (this.onInstalledReason != null) {
                if (this.onInstalledReason === 'install') {
                    BrowserApi.createNewTab('https://bitwarden.com/browser-start/');
                    await this.setDefaultSettings();
                } else if (this.onInstalledReason === 'update') {
                    await this.reseedStorage();
                }

                this.analytics.ga('send', {
                    hitType: 'event',
                    eventAction: 'onInstalled ' + this.onInstalledReason,
                });
                this.onInstalledReason = null;
            }
        }, 100);
    }

    private async reseedStorage() {
        if (!this.platformUtilsService.isChrome() && !this.platformUtilsService.isVivaldi() &&
            !this.platformUtilsService.isOpera()) {
            return;
        }

        const currentLockOption = await this.storageService.get<number>(ConstantsService.lockOptionKey);
        if (currentLockOption == null) {
            return;
        }

        const reseed124Key = 'reseededStorage124';
        const reseeded124 = await this.storageService.get<boolean>(reseed124Key);
        if (reseeded124) {
            return;
        }

        const getStorage = (): Promise<any> => new Promise((resolve) => {
            chrome.storage.local.get(null, (o: any) => resolve(o));
        });

        const clearStorage = (): Promise<void> => new Promise((resolve) => {
            chrome.storage.local.clear(() => resolve());
        });

        const storage = await getStorage();
        await clearStorage();

        for (const key in storage) {
            if (!storage.hasOwnProperty(key)) {
                continue;
            }

            await this.storageService.save(key, storage[key]);
        }

        await this.storageService.save(reseed124Key, true);
    }

    private async setDefaultSettings() {
        // Default lock options to "on restart".
        const currentLockOption = await this.storageService.get<number>(ConstantsService.lockOptionKey);
        if (currentLockOption == null) {
            await this.storageService.save(ConstantsService.lockOptionKey, -1);
        }
    }

    private async getDataForTab(tab: any, responseCommand: string) {
        const responseData: any = {};
        if (responseCommand === 'notificationBarDataResponse') {
            responseData.neverDomains = await this.storageService.get<any>(ConstantsService.neverDomainsKey);
            responseData.disabledNotification = await this.storageService.get<boolean>(
                ConstantsService.disableAddLoginNotificationKey);
        } else if (responseCommand === 'autofillerAutofillOnPageLoadEnabledResponse') {
            responseData.autofillEnabled = await this.storageService.get<boolean>(
                ConstantsService.enableAutoFillOnPageLoadKey);
        } else if (responseCommand === 'notificationBarFrameDataResponse') {
            responseData.i18n = {
                appName: this.i18nService.t('appName'),
                close: this.i18nService.t('close'),
                yes: this.i18nService.t('yes'),
                never: this.i18nService.t('never'),
                notificationAddSave: this.i18nService.t('notificationAddSave'),
                notificationNeverSave: this.i18nService.t('notificationNeverSave'),
                notificationAddDesc: this.i18nService.t('notificationAddDesc'),
                notificationChangeSave: this.i18nService.t('notificationChangeSave'),
                notificationChangeDesc: this.i18nService.t('notificationChangeDesc'),
            };
        }

        await BrowserApi.tabSendMessageData(tab, responseCommand, responseData);
    }
}
