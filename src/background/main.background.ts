import { CipherType } from '../enums/cipherType.enum';

import ApiService from '../services/api.service';
import AppIdService from '../services/appId.service';
import AutofillService from '../services/autofill.service';
import CipherService from '../services/cipher.service';
import CollectionService from '../services/collection.service';
import ConstantsService from '../services/constants.service';
import CryptoService from '../services/crypto.service';
import EnvironmentService from '../services/environment.service';
import FolderService from '../services/folder.service';
import i18nService from '../services/i18nService.js';
import LockService from '../services/lock.service';
import PasswordGenerationService from '../services/passwordGeneration.service';
import SettingsService from '../services/settings.service';
import SyncService from '../services/sync.service';
import TokenService from '../services/token.service';
import TotpService from '../services/totp.service';
import UserService from '../services/user.service';
import UtilsService from '../services/utils.service';

export default class MainBackground {
    utilsService: UtilsService;
    i18nService: any;
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

    constructor(window: Window) {
        // Services
        this.utilsService = new UtilsService();
        this.i18nService = new i18nService(this.utilsService);
        this.constantsService = new ConstantsService(this.i18nService, this.utilsService);
        this.cryptoService = new CryptoService();
        this.tokenService = new TokenService();
        this.appIdService = new AppIdService();
        this.apiService = new ApiService(this.tokenService, this.logout);
        this.environmentService = new EnvironmentService(this.apiService);
        this.userService = new UserService(this.tokenService);
        this.settingsService = new SettingsService(this.userService);
        this.cipherService = new CipherService(this.cryptoService, this.userService,
            this.settingsService, this.apiService);
        this.folderService = new FolderService(this.cryptoService, this.userService,
            this.i18nService, this.apiService);
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
            opr.sidebarAction : chrome.sidebarAction;
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
            title: 'bitwarden'
        });

        await this.contextMenusCreate({
            type: 'normal',
            id: 'autofill',
            parentId: 'root',
            contexts: ['all'],
            title: this.i18nService.autoFill
        });

        // Firefox & Edge do not support writing to the clipboard from background
        if (!this.utilsService.isFirefox() && !this.utilsService.isEdge()) {
            await this.contextMenusCreate({
                type: 'normal',
                id: 'copy-username',
                parentId: 'root',
                contexts: ['all'],
                title: this.i18nService.copyUsername
            });

            await this.contextMenusCreate({
                type: 'normal',
                id: 'copy-password',
                parentId: 'root',
                contexts: ['all'],
                title: this.i18nService.copyPassword
            });

            await this.contextMenusCreate({
                type: 'separator',
                parentId: 'root'
            });

            await this.contextMenusCreate({
                type: 'normal',
                id: 'generate-password',
                parentId: 'root',
                contexts: ['all'],
                title: this.i18nService.generatePasswordCopied
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

        var tabDomain = this.utilsService.getDomain(url);
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
                ciphers.forEach((ciphers) => {
                    this.loadLoginContextMenuOptions(ciphers);
                });
            }

            var theText = '';
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
                title: title
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
                title: title
            });
        }

        if (cipher.login.password && cipher.login.password !== '') {
            await this.contextMenusCreate({
                type: 'normal',
                id: 'copy-password_' + idSuffix,
                parentId: 'copy-password',
                contexts: ['all'],
                title: title
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
            sender: 'contextMenu'
        }, function () { });
    }

    private async autofillPage() {
        await this.autofillService.doAutoFill({
            cipher: this.loginToAutoFill,
            pageDetails: this.pageDetailsToAutoFill,
            fromBackground: true
        });

        // reset
        this.loginToAutoFill = null;
        this.pageDetailsToAutoFill = [];
    }

    private async logout(expired: boolean, callback: Function) {
        const userId = await this.userService.getUserId();

        await Promise.all([
            this.syncService.setLastSync(new Date(0)),
            this.tokenService.clearToken(),
            this.cryptoService.clearKeys(),
            this.userService.clear(),
            this.settingsService.clear(userId),
            this.cipherService.clear(userId),
            this.folderService.clear(userId),
            this.passwordGenerationService.clear()
        ]);

        chrome.runtime.sendMessage({
            command: 'doneLoggingOut', expired: expired
        });

        await this.setIcon();
        await this.refreshBadgeAndMenu();

        if (callback != null) {
            callback();
        }
    }

    // Browser APIs

    private contextMenusRemoveAll() {
        return new Promise((resolve) => {
            chrome.contextMenus.removeAll(function () {
                resolve();
                if (chrome.runtime.lastError) {
                    return;
                }
            });
        });
    }

    private contextMenusCreate(options: any) {
        return new Promise((resolve) => {
            chrome.contextMenus.create(options, function () {
                resolve();
                if (chrome.runtime.lastError) {
                    return;
                }
            });
        });
    }

    private tabsQuery(options: any): Promise<any[]> {
        return new Promise((resolve) => {
            chrome.tabs.query(options, function (tabs: any[]) {
                resolve(tabs);
            });
        });
    }

    private tabsQueryFirst(options: any): Promise<any> {
        return new Promise((resolve) => {
            chrome.tabs.query(options, function (tabs: any[]) {
                if (tabs.length > 0) {
                    resolve(tabs[0]);
                    return;
                }

                resolve(null);
            });
        });
    }

    private actionSetIcon(theAction: any, suffix: string): Promise<any> {
        if (!theAction || !theAction.setIcon) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            theAction.setIcon({
                path: {
                    '19': 'images/icon19' + suffix + '.png',
                    '38': 'images/icon38' + suffix + '.png',
                }
            }, function () {
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
                tabId: tabId
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
                tabId: tabId
            });
        } else if (this.sidebarAction.setTitle) {
            let title = 'bitwarden';
            if (text && text !== '') {
                title += (' [' + text + ']');
            }

            this.sidebarAction.setTitle({
                title: title,
                tabId: tabId
            });
        }
    }

    private async currentTabSendMessage(command: string, data: any) {
        var tab = await this.tabsQueryFirst({ active: true, currentWindow: true });
        if (tab == null) {
            return;
        }

        await this.tabSendMessage(tab.id, command, data);
    }

    private async tabSendMessage(tabId: number, command: string, data: any) {
        if (!tabId) {
            return;
        }

        const obj: any = {
            command: command
        };

        if (data != null) {
            obj.data = data;
        }

        return new Promise((resolve) => {
            chrome.tabs.sendMessage(tabId, obj, function () {
                resolve();
            });
        });
    }
}
