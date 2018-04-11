import { CipherType } from 'jslib/enums';

import { CipherView } from 'jslib/models/view/cipherView';
import { LoginUriView } from 'jslib/models/view/loginUriView';
import { LoginView } from 'jslib/models/view/loginView';

import { ConstantsService } from 'jslib/services/constants.service';
import { UtilsService } from 'jslib/services/utils.service';

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
            case 'bgAddClose':
                this.removeAddLogin(sender.tab);
                break;
            case 'bgAddSave':
                await this.saveAddLogin(sender.tab);
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
                        await this.autofillService.doAutoFillForLastUsedLogin([{
                            frameId: sender.frameId,
                            tab: msg.tab,
                            details: msg.details,
                        }], msg.sender === 'autofill_cmd');
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
        await this.autofillService.doAutoFill({
            cipher: this.main.loginToAutoFill,
            pageDetails: this.pageDetailsToAutoFill,
            fromBackground: true,
        });

        // reset
        this.main.loginToAutoFill = null;
        this.pageDetailsToAutoFill = [];
    }

    private async saveAddLogin(tab: any) {
        for (let i = this.main.loginsToAdd.length - 1; i >= 0; i--) {
            if (this.main.loginsToAdd[i].tabId !== tab.id) {
                continue;
            }

            const loginInfo = this.main.loginsToAdd[i];
            const tabDomain = this.platformUtilsService.getDomain(tab.url);
            if (tabDomain != null && tabDomain !== loginInfo.domain) {
                continue;
            }

            this.main.loginsToAdd.splice(i, 1);

            const loginModel = new LoginView();
            const loginUri = new LoginUriView();
            loginUri.uri = loginInfo.uri;
            loginModel.uris = [loginUri];
            loginModel.username = loginInfo.username;
            loginModel.password = loginInfo.password;
            const model = new CipherView();
            model.name = loginInfo.name;
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

    private async saveNever(tab: any) {
        for (let i = this.main.loginsToAdd.length - 1; i >= 0; i--) {
            if (this.main.loginsToAdd[i].tabId !== tab.id) {
                continue;
            }

            const loginInfo = this.main.loginsToAdd[i];
            const tabDomain = this.platformUtilsService.getDomain(tab.url);
            if (tabDomain != null && tabDomain !== loginInfo.domain) {
                continue;
            }

            this.main.loginsToAdd.splice(i, 1);
            const hostname = UtilsService.getHostname(tab.url);
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
            // remove any old logins for this tab
            this.removeAddLogin(tab);

            this.main.loginsToAdd.push({
                username: loginInfo.username,
                password: loginInfo.password,
                name: loginDomain,
                domain: loginDomain,
                uri: loginInfo.url,
                tabId: tab.id,
                expires: new Date((new Date()).getTime() + 30 * 60000), // 30 minutes
            });

            await this.main.checkLoginsToAdd(tab);
        }
    }

    private removeAddLogin(tab: any) {
        for (let i = this.main.loginsToAdd.length - 1; i >= 0; i--) {
            if (this.main.loginsToAdd[i].tabId === tab.id) {
                this.main.loginsToAdd.splice(i, 1);
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
            };
        }

        await BrowserApi.tabSendMessageData(tab, responseCommand, responseData);
    }
}
