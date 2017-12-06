import { CipherType } from '../enums/cipherType.enum';

import { Cipher } from '../models/domain/cipher';

import ApiService from '../services/api.service';
import AppIdService from '../services/appId.service';
import AutofillService from '../services/autofill.service';
import CipherService from '../services/cipher.service';
import CollectionService from '../services/collection.service';
import ConstantsService from '../services/constants.service';
import CryptoService from '../services/crypto.service';
import EnvironmentService from '../services/environment.service';
import FolderService from '../services/folder.service';
import i18nService from '../services/i18n.service';
import LockService from '../services/lock.service';
import PasswordGenerationService from '../services/passwordGeneration.service';
import SettingsService from '../services/settings.service';
import SyncService from '../services/sync.service';
import TokenService from '../services/token.service';
import TotpService from '../services/totp.service';
import UserService from '../services/user.service';
import UtilsService from '../services/utils.service';

export default class MainBackground {
    i18nService: any;
    utilsService: UtilsService;
    constantsService: ConstantsService;
    cryptoService: CryptoService;
    tokenService: TokenService;
    appIdService: AppIdService;
    apiService: ApiService;
    environmentService: EnvironmentService;
    userService: UserService;
    settingsService: SettingsService;
    cipherService: CipherService;
    folderService: FolderService;
    collectionService: CollectionService;
    lockService: LockService;
    syncService: SyncService;
    passwordGenerationService: PasswordGenerationService;
    totpService: TotpService;
    autofillService: AutofillService;

    private sidebarAction: any;
    private buildingContextMenu: boolean;
    private onUpdatedRan: boolean;
    private onReplacedRan: boolean;
    private menuOptionsLoaded: any[] = [];
    private loginToAutoFill: any = null;
    private pageDetailsToAutoFill: any[] = [];
    private loginsToAdd: any[] = [];
    private syncTimeout: number;
    private autofillTimeout: number;
    private pendingAuthRequests: any[] = [];

    constructor() {
        // Services
        this.utilsService = new UtilsService();
        this.i18nService = i18nService();
        this.constantsService = new ConstantsService(i18nService, this.utilsService);
        this.cryptoService = new CryptoService();
        this.tokenService = new TokenService();
        this.appIdService = new AppIdService();
        this.apiService = new ApiService(this.tokenService, this.logout);
        this.environmentService = new EnvironmentService(this.apiService);
        this.userService = new UserService(this.tokenService);
        this.settingsService = new SettingsService(this.userService);
        this.cipherService = new CipherService(this.cryptoService, this.userService, this.settingsService,
            this.apiService);
        this.folderService = new FolderService(this.cryptoService, this.userService, i18nService,
            this.apiService);
        this.collectionService = new CollectionService(this.cryptoService, this.userService);
        this.lockService = new LockService(this.cipherService, this.folderService, this.collectionService,
            this.cryptoService, this.utilsService, this.setIcon, this.refreshBadgeAndMenu);
        this.syncService = new SyncService(this.userService, this.apiService, this.settingsService,
            this.folderService, this.cipherService, this.cryptoService, this.collectionService, this.logout);
        this.passwordGenerationService = new PasswordGenerationService(this.cryptoService);
        this.totpService = new TotpService();
        this.autofillService = new AutofillService(this.cipherService, this.tokenService,
            this.totpService, this.utilsService);

        // Other fields
        this.sidebarAction = (typeof opr !== 'undefined') && opr.sidebarAction ?
            opr.sidebarAction : (window as any).chrome.sidebarAction;
    }

    async bootstrap() {
        // Chrome APIs
        if (chrome.commands) {
            chrome.commands.onCommand.addListener((command: any) => {
                if (command === 'generate_password') {
                    (window as any).ga('send', {
                        hitType: 'event',
                        eventAction: 'Generated Password From Command',
                    });
                    this.passwordGenerationService.getOptions().then((options) => {
                        const password = PasswordGenerationService.generatePassword(options);
                        UtilsService.copyToClipboard(password);
                        this.passwordGenerationService.addHistory(password);
                    });
                } else if (command === 'autofill_login') {
                    this.tabsQueryFirst({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }).then((tab) => {
                        if (tab != null) {
                            (window as any).ga('send', {
                                hitType: 'event',
                                eventAction: 'Autofilled From Command',
                            });
                            this.collectPageDetailsForContentScript(tab, 'autofill_cmd');
                        }
                    });
                }
            });
        }

        chrome.runtime.onMessage.addListener((msg: any, sender: any, sendResponse: any) => {
            if (msg.command === 'loggedIn' || msg.command === 'unlocked' || msg.command === 'locked') {
                this.setIcon();
                this.refreshBadgeAndMenu();
            } else if (msg.command === 'logout') {
                this.logout(msg.expired);
            } else if (msg.command === 'syncCompleted' && msg.successfully) {
                setTimeout(async () => await this.refreshBadgeAndMenu(), 2000);
            } else if (msg.command === 'bgOpenOverlayPopup') {
                this.currentTabSendMessage('openOverlayPopup', msg.data);
            } else if (msg.command === 'bgCloseOverlayPopup') {
                this.currentTabSendMessage('closeOverlayPopup');
            } else if (msg.command === 'bgOpenNotificationBar') {
                this.tabSendMessage(sender.tab.id, 'openNotificationBar', msg.data);
            } else if (msg.command === 'bgCloseNotificationBar') {
                this.tabSendMessage(sender.tab.id, 'closeNotificationBar');
            } else if (msg.command === 'bgAdjustNotificationBar') {
                this.tabSendMessage(sender.tab.id, 'adjustNotificationBar', msg.data);
            } else if (msg.command === 'bgCollectPageDetails') {
                this.collectPageDetailsForContentScript(sender.tab, msg.sender, sender.frameId);
            } else if (msg.command === 'bgAddLogin') {
                this.addLogin(msg.login, sender.tab);
            } else if (msg.command === 'bgAddClose') {
                this.removeAddLogin(sender.tab);
            } else if (msg.command === 'bgAddSave') {
                this.saveAddLogin(sender.tab);
            } else if (msg.command === 'bgNeverSave') {
                this.saveNever(sender.tab);
            } else if (msg.command === 'collectPageDetailsResponse') {
                if (msg.sender === 'notificationBar') {
                    const forms = this.autofillService.getFormsWithPasswordFields(msg.details);
                    this.tabSendMessage(msg.tab.id, 'notificationBarPageDetails', {
                        details: msg.details,
                        forms: forms,
                    });
                } else if (msg.sender === 'autofiller' || msg.sender === 'autofill_cmd') {
                    this.autofillService.doAutoFillForLastUsedLogin([{
                        frameId: sender.frameId,
                        tab: msg.tab,
                        details: msg.details,
                    }], msg.sender === 'autofill_cmd');
                } else if (msg.sender === 'contextMenu') {
                    clearTimeout(this.autofillTimeout);
                    this.pageDetailsToAutoFill.push({ frameId: sender.frameId, tab: msg.tab, details: msg.details });
                    this.autofillTimeout = setTimeout(async () => await this.autofillPage(), 300);
                }
            } else if (msg.command === 'bgUpdateContextMenu') {
                this.refreshBadgeAndMenu();
            }
        });

        if (chrome.runtime.onInstalled) {
            chrome.runtime.onInstalled.addListener((details: any) => {
                (window as any).ga('send', {
                    hitType: 'event',
                    eventAction: 'onInstalled ' + details.reason,
                });

                if (details.reason === 'install') {
                    chrome.tabs.create({ url: 'https://bitwarden.com/browser-start/' });
                }
            });
        }

        chrome.tabs.onActivated.addListener((activeInfo: any) => {
            this.refreshBadgeAndMenu();
        });

        chrome.tabs.onReplaced.addListener((addedTabId: any, removedTabId: any) => {
            if (this.onReplacedRan) {
                return;
            }
            this.onReplacedRan = true;
            this.checkLoginsToAdd();
            this.refreshBadgeAndMenu();
        });

        chrome.tabs.onUpdated.addListener((tabId: any, changeInfo: any, tab: any) => {
            if (this.onUpdatedRan) {
                return;
            }
            this.onUpdatedRan = true;
            this.checkLoginsToAdd();
            this.refreshBadgeAndMenu();
        });

        if (chrome.windows) {
            chrome.windows.onFocusChanged.addListener((windowId: any) => {
                if (windowId === null || windowId < 0) {
                    return;
                }

                this.refreshBadgeAndMenu();
            });
        }

        if (chrome.contextMenus) {
            chrome.contextMenus.onClicked.addListener((info: any, tab: any) => {
                if (info.menuItemId === 'generate-password') {
                    (window as any).ga('send', {
                        hitType: 'event',
                        eventAction: 'Generated Password From Context Menu',
                    });
                    this.passwordGenerationService.getOptions().then((options) => {
                        const password = PasswordGenerationService.generatePassword(options);
                        UtilsService.copyToClipboard(password);
                        this.passwordGenerationService.addHistory(password);
                    });
                } else if (info.parentMenuItemId === 'autofill' || info.parentMenuItemId === 'copy-username' ||
                    info.parentMenuItemId === 'copy-password') {
                    const id = info.menuItemId.split('_')[1];
                    if (id === 'noop') {
                        if ((window as any).chrome.browserAction.openPopup) {
                            (window as any).chrome.browserAction.openPopup();
                        }
                        return;
                    }

                    this.cipherService.getAllDecrypted().then((ciphers) => {
                        for (let i = 0; i < ciphers.length; i++) {
                            const cipher = ciphers[i];
                            if (cipher.id !== id) {
                                continue;
                            }

                            if (info.parentMenuItemId === 'autofill') {
                                (window as any).ga('send', {
                                    hitType: 'event',
                                    eventAction: 'Autofilled From Context Menu',
                                });
                                this.startAutofillPage(cipher);
                            } else if (info.parentMenuItemId === 'copy-username') {
                                (window as any).ga('send', {
                                    hitType: 'event',
                                    eventAction: 'Copied Username From Context Menu',
                                });
                                UtilsService.copyToClipboard(cipher.login.username);
                            } else if (info.parentMenuItemId === 'copy-password') {
                                (window as any).ga('send', {
                                    hitType: 'event',
                                    eventAction: 'Copied Password From Context Menu',
                                });
                                UtilsService.copyToClipboard(cipher.login.password);
                            }

                            break;
                        }
                    });
                }
            });
        }

        if (chrome.webRequest && chrome.webRequest.onAuthRequired) {
            (window as any).chrome.webRequest.onAuthRequired.addListener((details: any, callback: any) => {
                if (!details.url || this.pendingAuthRequests.indexOf(details.requestId) !== -1) {
                    if (callback) {
                        callback();
                    }
                    return;
                }

                const domain = UtilsService.getDomain(details.url);
                if (domain == null) {
                    if (callback) {
                        callback();
                    }
                    return;
                }

                this.pendingAuthRequests.push(details.requestId);

                if (this.utilsService.isFirefox()) {
                    return new Promise((resolve, reject) => {
                        this.cipherService.getAllDecryptedForDomain(domain).then((ciphers) => {
                            if (ciphers == null || ciphers.length !== 1) {
                                reject();
                                return;
                            }

                            resolve({
                                authCredentials: {
                                    username: ciphers[0].login.username,
                                    password: ciphers[0].login.password,
                                },
                            });
                        }, () => {
                            reject();
                        });
                    });
                } else {
                    this.cipherService.getAllDecryptedForDomain(domain).then((ciphers) => {
                        if (ciphers == null || ciphers.length !== 1) {
                            callback();
                            return;
                        }

                        callback({
                            authCredentials: {
                                username: ciphers[0].login.username,
                                password: ciphers[0].login.password,
                            },
                        });
                    }, () => {
                        callback();
                    });
                }
            }, { urls: ['http://*/*', 'https://*/*'] }, [this.utilsService.isFirefox() ? 'blocking' : 'asyncBlocking']);

            chrome.webRequest.onCompleted.addListener(this.completeAuthRequest, { urls: ['http://*/*'] });
            chrome.webRequest.onErrorOccurred.addListener(this.completeAuthRequest, { urls: ['http://*/*'] });
        }

        // Bootstrap
        await this.environmentService.setUrlsFromStorage();
        this.setIcon();
        this.cleanupLoginsToAdd();
        this.fullSync(true);
    }

    private completeAuthRequest(details: any) {
        const i = this.pendingAuthRequests.indexOf(details.requestId);
        if (i > -1) {
            this.pendingAuthRequests.splice(i, 1);
        }
    }

    private async buildContextMenu() {
        if (!chrome.contextMenus || this.buildingContextMenu) {
            return;
        }

        this.buildingContextMenu = true;
        await this.contextMenusRemoveAll();

        await this.contextMenusCreate({
            type: 'normal',
            id: 'root',
            contexts: ['all'],
            title: 'bitwarden',
        });

        await this.contextMenusCreate({
            type: 'normal',
            id: 'autofill',
            parentId: 'root',
            contexts: ['all'],
            title: this.i18nService.autoFill,
        });

        // Firefox & Edge do not support writing to the clipboard from background
        if (!this.utilsService.isFirefox() && !this.utilsService.isEdge()) {
            await this.contextMenusCreate({
                type: 'normal',
                id: 'copy-username',
                parentId: 'root',
                contexts: ['all'],
                title: this.i18nService.copyUsername,
            });

            await this.contextMenusCreate({
                type: 'normal',
                id: 'copy-password',
                parentId: 'root',
                contexts: ['all'],
                title: this.i18nService.copyPassword,
            });

            await this.contextMenusCreate({
                type: 'separator',
                parentId: 'root',
            });

            await this.contextMenusCreate({
                type: 'normal',
                id: 'generate-password',
                parentId: 'root',
                contexts: ['all'],
                title: this.i18nService.generatePasswordCopied,
            });
        }

        this.buildingContextMenu = false;
    }

    private async setIcon() {
        if (!chrome.browserAction && !this.sidebarAction) {
            return;
        }

        const isAuthenticated = await this.userService.isAuthenticated();
        const key = await this.cryptoService.getKey();

        let suffix = '';
        if (!isAuthenticated) {
            suffix = '_gray';
        } else if (!key) {
            suffix = '_locked';
        }

        await this.actionSetIcon(chrome.browserAction, suffix);
        await this.actionSetIcon(this.sidebarAction, suffix);
    }

    private async refreshBadgeAndMenu() {
        if (!chrome.windows || !chrome.contextMenus) {
            return;
        }

        const self = this;
        const tab = await this.tabsQueryFirst({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT });
        if (!tab) {
            return;
        }

        const disabled = await self.utilsService.getObjFromStorage<boolean>(ConstantsService.disableContextMenuItemKey);
        if (!disabled) {
            await this.buildContextMenu();
            this.contextMenuReady(tab, true);
        } else {
            await this.contextMenusRemoveAll();
            self.contextMenuReady(tab, false);
        }
    }

    private async contextMenuReady(tab: any, contextMenuEnabled: boolean) {
        await this.loadMenuAndUpdateBadge(tab.url, tab.id, contextMenuEnabled);
        this.onUpdatedRan = this.onReplacedRan = false;
    }

    private async loadMenuAndUpdateBadge(url: string, tabId: number, contextMenuEnabled: boolean) {
        if (!url || (!chrome.browserAction && !this.sidebarAction)) {
            return;
        }

        const tabDomain = this.utilsService.getDomain(url);
        if (tabDomain == null) {
            return;
        }

        this.actionSetBadgeBackgroundColor(chrome.browserAction);
        this.actionSetBadgeBackgroundColor(this.sidebarAction);

        this.menuOptionsLoaded = [];
        try {
            const ciphers = await this.cipherService.getAllDecryptedForDomain(tabDomain);
            ciphers.sort(this.cipherService.sortCiphersByLastUsedThenName);

            if (contextMenuEnabled) {
                ciphers.forEach((cipher) => {
                    this.loadLoginContextMenuOptions(cipher);
                });
            }

            let theText = '';
            if (ciphers.length > 0 && ciphers.length < 9) {
                theText = ciphers.length.toString();
            } else if (ciphers.length > 0) {
                theText = '9+';
            } else {
                if (contextMenuEnabled) {
                    this.loadNoLoginsContextMenuOptions(this.i18nService.noMatchingLogins);
                }
            }

            this.browserActionSetBadgeText(theText, tabId);
            this.sidebarActionSetBadgeText(theText, tabId);
        } catch (e) {
            if (contextMenuEnabled) {
                this.loadNoLoginsContextMenuOptions(this.i18nService.vaultLocked);
            }
            this.browserActionSetBadgeText('', tabId);
            this.sidebarActionSetBadgeText('', tabId);
        }
    }

    private async loadLoginContextMenuOptions(cipher: any) {
        if (cipher == null || cipher.type !== CipherType.Login) {
            return;
        }

        const title = cipher.name + (cipher.login.username && cipher.login.username !== '' ?
            ' (' + cipher.login.username + ')' : '');
        await this.loadContextMenuOptions(title, cipher.id, cipher);
    }

    private async loadNoLoginsContextMenuOptions(noLoginsMessage: string) {
        await this.loadContextMenuOptions(noLoginsMessage, 'noop', null);
    }

    private async loadContextMenuOptions(title: string, idSuffix: string, cipher: any) {
        if (!chrome.contextMenus || this.menuOptionsLoaded.indexOf(idSuffix) > -1 ||
            (cipher != null && cipher.type !== CipherType.Login)) {
            return;
        }

        this.menuOptionsLoaded.push(idSuffix);

        if (cipher == null) {
            return;
        }

        if (cipher.login.password && cipher.login.password !== '') {
            await this.contextMenusCreate({
                type: 'normal',
                id: 'autofill_' + idSuffix,
                parentId: 'autofill',
                contexts: ['all'],
                title: title,
            });
        }

        if (this.utilsService.isFirefox()) {
            // Firefox does not support writing to the clipboard from background
            return;
        }

        if (cipher.login.username && cipher.login.username !== '') {
            await this.contextMenusCreate({
                type: 'normal',
                id: 'copy-username_' + idSuffix,
                parentId: 'copy-username',
                contexts: ['all'],
                title: title,
            });
        }

        if (cipher.login.password && cipher.login.password !== '') {
            await this.contextMenusCreate({
                type: 'normal',
                id: 'copy-password_' + idSuffix,
                parentId: 'copy-password',
                contexts: ['all'],
                title: title,
            });
        }
    }

    private async startAutofillPage(cipher: any) {
        this.loginToAutoFill = cipher;
        const tab = await this.tabsQueryFirst({ active: true, currentWindow: true });
        if (tab == null) {
            return;
        }

        chrome.tabs.sendMessage(tab.id, {
            command: 'collectPageDetails',
            tab: tab,
            sender: 'contextMenu',
        });
    }

    private async autofillPage() {
        await this.autofillService.doAutoFill({
            cipher: this.loginToAutoFill,
            pageDetails: this.pageDetailsToAutoFill,
            fromBackground: true,
        });

        // reset
        this.loginToAutoFill = null;
        this.pageDetailsToAutoFill = [];
    }

    private async logout(expired: boolean) {
        const userId = await this.userService.getUserId();

        await Promise.all([
            this.syncService.setLastSync(new Date(0)),
            this.tokenService.clearToken(),
            this.cryptoService.clearKeys(),
            this.userService.clear(),
            this.settingsService.clear(userId),
            this.cipherService.clear(userId),
            this.folderService.clear(userId),
            this.passwordGenerationService.clear(),
        ]);

        chrome.runtime.sendMessage({
            command: 'doneLoggingOut', expired: expired,
        });

        await this.setIcon();
        await this.refreshBadgeAndMenu();
    }

    private collectPageDetailsForContentScript(tab: any, sender: string, frameId: number = null) {
        if (tab == null || !tab.id) {
            return;
        }

        const options: any = {};
        if (frameId != null) {
            options.frameId = frameId;
        }

        chrome.tabs.sendMessage(tab.id, {
            command: 'collectPageDetails',
            tab: tab,
            sender: sender,
        }, options, () => {
            if (chrome.runtime.lastError) {
                return;
            }
        });
    }

    private async addLogin(loginInfo: any, tab: any) {
        const loginDomain = UtilsService.getDomain(loginInfo.url);
        if (loginDomain == null) {
            return;
        }

        const ciphers = await this.cipherService.getAllDecryptedForDomain(loginDomain);

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

            this.loginsToAdd.push({
                username: loginInfo.username,
                password: loginInfo.password,
                name: loginDomain,
                domain: loginDomain,
                uri: loginInfo.url,
                tabId: tab.id,
                expires: new Date((new Date()).getTime() + 30 * 60000), // 30 minutes
            });

            await this.checkLoginsToAdd(tab);
        }
    }

    private cleanupLoginsToAdd() {
        for (let i = this.loginsToAdd.length - 1; i >= 0; i--) {
            if (this.loginsToAdd[i].expires < new Date()) {
                this.loginsToAdd.splice(i, 1);
            }
        }

        setTimeout(() => this.cleanupLoginsToAdd(), 2 * 60 * 1000); // check every 2 minutes
    }

    private removeAddLogin(tab: any) {
        for (let i = this.loginsToAdd.length - 1; i >= 0; i--) {
            if (this.loginsToAdd[i].tabId === tab.id) {
                this.loginsToAdd.splice(i, 1);
            }
        }
    }

    private async saveAddLogin(tab: any) {
        for (let i = this.loginsToAdd.length - 1; i >= 0; i--) {
            if (this.loginsToAdd[i].tabId !== tab.id) {
                continue;
            }

            const loginInfo = this.loginsToAdd[i];
            const tabDomain = UtilsService.getDomain(tab.url);
            if (tabDomain != null && tabDomain !== loginInfo.domain) {
                continue;
            }

            this.loginsToAdd.splice(i, 1);

            const cipher = await this.cipherService.encrypt({
                id: null,
                folderId: null,
                favorite: false,
                name: loginInfo.name,
                notes: null,
                type: CipherType.Login,
                login: {
                    uri: loginInfo.uri,
                    username: loginInfo.username,
                    password: loginInfo.password,
                },
            });

            await this.cipherService.saveWithServer(cipher);
            (window as any).ga('send', {
                hitType: 'event',
                eventAction: 'Added Login from Notification Bar',
            });

            this.tabSendMessage(tab.id, 'closeNotificationBar');
        }
    }

    private async checkLoginsToAdd(tab: any = null): Promise<any> {
        if (!this.loginsToAdd.length) {
            return;
        }

        if (tab != null) {
            this.doCheck(tab);
            return;
        }

        const currentTab = await this.tabsQueryFirst({ active: true, currentWindow: true });
        if (currentTab != null) {
            this.doCheck(currentTab);
        }
    }

    private doCheck(tab: any) {
        if (tab == null) {
            return;
        }

        const tabDomain = UtilsService.getDomain(tab.url);
        if (tabDomain == null) {
            return;
        }

        for (let i = 0; i < this.loginsToAdd.length; i++) {
            if (this.loginsToAdd[i].tabId !== tab.id || this.loginsToAdd[i].domain !== tabDomain) {
                continue;
            }

            this.tabSendMessage(tab.id, 'openNotificationBar', {
                type: 'add',
            });
            break;
        }
    }

    private async saveNever(tab: any) {
        for (let i = this.loginsToAdd.length - 1; i >= 0; i--) {
            if (this.loginsToAdd[i].tabId !== tab.id) {
                continue;
            }

            const loginInfo = this.loginsToAdd[i];
            const tabDomain = UtilsService.getDomain(tab.url);
            if (tabDomain != null && tabDomain !== loginInfo.domain) {
                continue;
            }

            this.loginsToAdd.splice(i, 1);
            const hostname = UtilsService.getHostname(tab.url);
            await this.cipherService.saveNeverDomain(hostname);
            this.tabSendMessage(tab.id, 'closeNotificationBar');
        }
    }

    private async fullSync(override: boolean = false) {
        const syncInternal = 6 * 60 * 60 * 1000; // 6 hours
        const lastSync = await this.syncService.getLastSync();

        let lastSyncAgo = syncInternal + 1;
        if (lastSync != null) {
            lastSyncAgo = new Date().getTime() - lastSync.getTime();
        }

        if (override || lastSyncAgo >= syncInternal) {
            await this.syncService.fullSync(override);
            this.scheduleNextSync();
        } else {
            this.scheduleNextSync();
        }
    }

    private scheduleNextSync() {
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
        }

        this.syncTimeout = setTimeout(async () => await this.fullSync(), 5 * 60 * 1000); // check every 5 minutes
    }

    // Browser API Helpers

    private contextMenusRemoveAll() {
        return new Promise((resolve) => {
            chrome.contextMenus.removeAll(() => {
                resolve();
                if (chrome.runtime.lastError) {
                    return;
                }
            });
        });
    }

    private contextMenusCreate(options: any) {
        return new Promise((resolve) => {
            chrome.contextMenus.create(options, () => {
                resolve();
                if (chrome.runtime.lastError) {
                    return;
                }
            });
        });
    }

    private tabsQuery(options: any): Promise<any[]> {
        return new Promise((resolve) => {
            chrome.tabs.query(options, (tabs: any[]) => {
                resolve(tabs);
            });
        });
    }

    private async tabsQueryFirst(options: any): Promise<any> {
        const tabs = await this.tabsQuery(options);
        if (tabs.length > 0) {
            return tabs[0];
        }

        return null;
    }

    private actionSetIcon(theAction: any, suffix: string): Promise<any> {
        if (!theAction || !theAction.setIcon) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            theAction.setIcon({
                path: {
                    19: 'images/icon19' + suffix + '.png',
                    38: 'images/icon38' + suffix + '.png',
                },
            }, () => {
                resolve();
            });
        });
    }

    private actionSetBadgeBackgroundColor(action: any) {
        if (action && action.setBadgeBackgroundColor) {
            action.setBadgeBackgroundColor({ color: '#294e5f' });
        }
    }

    private browserActionSetBadgeText(text: string, tabId: number) {
        if (chrome.browserAction && chrome.browserAction.setBadgeText) {
            chrome.browserAction.setBadgeText({
                text: text,
                tabId: tabId,
            });
        }
    }

    private sidebarActionSetBadgeText(text: string, tabId: number) {
        if (!this.sidebarAction) {
            return;
        }

        if (this.sidebarAction.setBadgeText) {
            this.sidebarAction.setBadgeText({
                text: text,
                tabId: tabId,
            });
        } else if (this.sidebarAction.setTitle) {
            let title = 'bitwarden';
            if (text && text !== '') {
                title += (' [' + text + ']');
            }

            this.sidebarAction.setTitle({
                title: title,
                tabId: tabId,
            });
        }
    }

    private async currentTabSendMessage(command: string, data: any = null) {
        const tab = await this.tabsQueryFirst({ active: true, currentWindow: true });
        if (tab == null) {
            return;
        }

        await this.tabSendMessage(tab.id, command, data);
    }

    private async tabSendMessage(tabId: number, command: string, data: any = null) {
        if (!tabId) {
            return;
        }

        const obj: any = {
            command: command,
        };

        if (data != null) {
            obj.data = data;
        }

        return new Promise((resolve) => {
            chrome.tabs.sendMessage(tabId, obj, () => {
                resolve();
            });
        });
    }
}
