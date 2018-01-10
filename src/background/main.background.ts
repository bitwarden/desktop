import { CipherType } from 'jslib/enums';

import {
    ApiService,
    AppIdService,
    CipherService,
    CollectionService,
    ConstantsService,
    ContainerService,
    CryptoService,
    EnvironmentService,
    FolderService,
    LockService,
    PasswordGenerationService,
    SettingsService,
    TokenService,
    TotpService,
    UserService,
    UtilsService,
} from 'jslib/services';

import {
    ApiService as ApiServiceAbstraction,
    AppIdService as AppIdServiceAbstraction,
    CipherService as CipherServiceAbstraction,
    CollectionService as CollectionServiceAbstraction,
    CryptoService as CryptoServiceAbstraction,
    EnvironmentService as EnvironmentServiceAbstraction,
    FolderService as FolderServiceAbstraction,
    LockService as LockServiceAbstraction,
    MessagingService as MessagingServiceAbstraction,
    PasswordGenerationService as PasswordGenerationServiceAbstraction,
    PlatformUtilsService as PlatformUtilsServiceAbstraction,
    SettingsService as SettingsServiceAbstraction,
    StorageService as StorageServiceAbstraction,
    TokenService as TokenServiceAbstraction,
    TotpService as TotpServiceAbstraction,
    UserService as UserServiceAbstraction,
    UtilsService as UtilsServiceAbstraction,
} from 'jslib/abstractions';

import BrowserApi from '../browser/browserApi';

import CommandsBackground from './commands.background';
import ContextMenusBackground from './contextMenus.background';
import IdleBackground from './idle.background';
import RuntimeBackground from './runtime.background';
import TabsBackground from './tabs.background';
import WebRequestBackground from './webRequest.background';
import WindowsBackground from './windows.background';

import AutofillService from '../services/autofill.service';
import BrowserMessagingService from '../services/browserMessaging.service';
import BrowserPlatformUtilsService from '../services/browserPlatformUtils.service';
import BrowserStorageService from '../services/browserStorage.service';
import i18nService from '../services/i18n.service';
import SyncService from '../services/sync.service';

export default class MainBackground {
    messagingService: MessagingServiceAbstraction;
    storageService: StorageServiceAbstraction;
    i18nService: any;
    platformUtilsService: PlatformUtilsServiceAbstraction;
    utilsService: UtilsServiceAbstraction;
    constantsService: ConstantsService;
    cryptoService: CryptoServiceAbstraction;
    tokenService: TokenServiceAbstraction;
    appIdService: AppIdServiceAbstraction;
    apiService: ApiServiceAbstraction;
    environmentService: EnvironmentServiceAbstraction;
    userService: UserServiceAbstraction;
    settingsService: SettingsServiceAbstraction;
    cipherService: CipherServiceAbstraction;
    folderService: FolderServiceAbstraction;
    collectionService: CollectionServiceAbstraction;
    lockService: LockServiceAbstraction;
    syncService: SyncService;
    passwordGenerationService: PasswordGenerationServiceAbstraction;
    totpService: TotpServiceAbstraction;
    autofillService: AutofillService;
    containerService: ContainerService;

    onUpdatedRan: boolean;
    onReplacedRan: boolean;
    loginToAutoFill: any = null;
    loginsToAdd: any[] = [];

    private commandsBackground: CommandsBackground;
    private contextMenusBackground: ContextMenusBackground;
    private idleBackground: IdleBackground;
    private runtimeBackground: RuntimeBackground;
    private tabsBackground: TabsBackground;
    private webRequestBackground: WebRequestBackground;
    private windowsBackground: WindowsBackground;

    private sidebarAction: any;
    private buildingContextMenu: boolean;
    private menuOptionsLoaded: any[] = [];
    private syncTimeout: number;

    constructor() {
        // Services
        this.utilsService = new UtilsService();
        this.platformUtilsService = new BrowserPlatformUtilsService();
        this.messagingService = new BrowserMessagingService(this.platformUtilsService);
        this.storageService = new BrowserStorageService(this.platformUtilsService);
        this.i18nService = i18nService(this.platformUtilsService);
        this.constantsService = new ConstantsService(this.i18nService, this.platformUtilsService);
        this.cryptoService = new CryptoService(this.storageService,
            this.storageService);
        this.tokenService = new TokenService(this.storageService);
        this.appIdService = new AppIdService(this.storageService);
        this.apiService = new ApiService(this.tokenService, this.platformUtilsService,
            (expired: boolean) => this.logout(expired));
        this.environmentService = new EnvironmentService(this.apiService, this.storageService);
        this.userService = new UserService(this.tokenService, this.storageService);
        this.settingsService = new SettingsService(this.userService, this.storageService);
        this.cipherService = new CipherService(this.cryptoService, this.userService, this.settingsService,
            this.apiService, this.storageService);
        this.folderService = new FolderService(this.cryptoService, this.userService, this.i18nService.noneFolder,
            this.apiService, this.storageService);
        this.collectionService = new CollectionService(this.cryptoService, this.userService, this.storageService);
        this.lockService = new LockService(this.cipherService, this.folderService, this.collectionService,
            this.cryptoService, this.platformUtilsService, this.storageService,
            () => this.setIcon(), () => this.refreshBadgeAndMenu());
        this.syncService = new SyncService(this.userService, this.apiService, this.settingsService,
            this.folderService, this.cipherService, this.cryptoService, this.collectionService,
            this.storageService, this.messagingService, (expired: boolean) => this.logout(expired));
        this.passwordGenerationService = new PasswordGenerationService(this.cryptoService, this.storageService);
        this.totpService = new TotpService(this.storageService);
        this.autofillService = new AutofillService(this.cipherService, this.tokenService,
            this.totpService, this.utilsService, this.platformUtilsService);
        this.containerService = new ContainerService(this.cryptoService, this.platformUtilsService);

        // Other fields
        this.sidebarAction = (typeof opr !== 'undefined') && opr.sidebarAction ?
            opr.sidebarAction : (window as any).chrome.sidebarAction;

        // Background
        this.commandsBackground = new CommandsBackground(this, this.passwordGenerationService);
        this.contextMenusBackground = new ContextMenusBackground(this, this.cipherService,
            this.passwordGenerationService);
        this.idleBackground = new IdleBackground(this, this.lockService, this.storageService);
        this.runtimeBackground = new RuntimeBackground(this, this.autofillService, this.cipherService,
            this.platformUtilsService);
        this.tabsBackground = new TabsBackground(this);
        this.webRequestBackground = new WebRequestBackground(this.platformUtilsService, this.cipherService);
        this.windowsBackground = new WindowsBackground(this);
    }

    async bootstrap() {
        this.containerService.attachToWindow(window);

        await this.commandsBackground.init();
        await this.contextMenusBackground.init();
        await this.idleBackground.init();
        await this.runtimeBackground.init();
        await this.tabsBackground.init();
        await this.webRequestBackground.init();
        await this.windowsBackground.init();

        await this.environmentService.setUrlsFromStorage();
        await this.setIcon();
        this.cleanupLoginsToAdd();
        await this.fullSync(true);
    }

    async setIcon() {
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

    async refreshBadgeAndMenu() {
        if (!chrome.windows || !chrome.contextMenus) {
            return;
        }

        const tab = await BrowserApi.getTabFromCurrentWindowId();
        if (!tab) {
            return;
        }

        const disabled = await this.storageService.get<boolean>(ConstantsService.disableContextMenuItemKey);
        if (!disabled) {
            await this.buildContextMenu();
            await this.contextMenuReady(tab, true);
        } else {
            await this.contextMenusRemoveAll();
            await this.contextMenuReady(tab, false);
        }
    }

    async logout(expired: boolean) {
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

        this.messagingService.send('doneLoggingOut', { expired: expired });

        await this.setIcon();
        await this.refreshBadgeAndMenu();
    }

    collectPageDetailsForContentScript(tab: any, sender: string, frameId: number = null) {
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

    async checkLoginsToAdd(tab: any = null): Promise<any> {
        if (!this.loginsToAdd.length) {
            return;
        }

        if (tab != null) {
            this.doCheck(tab);
            return;
        }

        const currentTab = await BrowserApi.getTabFromCurrentWindow();
        if (currentTab != null) {
            this.doCheck(currentTab);
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
        if (!this.platformUtilsService.isFirefox() && !this.platformUtilsService.isEdge()) {
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

    private async contextMenuReady(tab: any, contextMenuEnabled: boolean) {
        await this.loadMenuAndUpdateBadge(tab.url, tab.id, contextMenuEnabled);
        this.onUpdatedRan = this.onReplacedRan = false;
    }

    private async loadMenuAndUpdateBadge(url: string, tabId: number, contextMenuEnabled: boolean) {
        if (!url || (!chrome.browserAction && !this.sidebarAction)) {
            return;
        }

        const tabDomain = this.platformUtilsService.getDomain(url);
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
                    await this.loadNoLoginsContextMenuOptions(this.i18nService.noMatchingLogins);
                }
            }

            this.browserActionSetBadgeText(theText, tabId);
            this.sidebarActionSetBadgeText(theText, tabId);
        } catch (e) {
            if (contextMenuEnabled) {
                await this.loadNoLoginsContextMenuOptions(this.i18nService.vaultLocked);
            }
            this.browserActionSetBadgeText('', tabId);
            this.sidebarActionSetBadgeText('', tabId);
        }
    }

    private async loadLoginContextMenuOptions(cipher: any) {
        if (cipher == null || cipher.type !== CipherType.Login) {
            return;
        }

        let title = cipher.name;
        if (cipher.login.username && cipher.login.username !== '') {
            title += (' (' + cipher.login.username + ')');
        }
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

        if (cipher == null || (cipher.login.password && cipher.login.password !== '')) {
            await this.contextMenusCreate({
                type: 'normal',
                id: 'autofill_' + idSuffix,
                parentId: 'autofill',
                contexts: ['all'],
                title: title,
            });
        }

        if (this.platformUtilsService.isFirefox()) {
            // Firefox does not support writing to the clipboard from background
            return;
        }

        if (cipher == null || (cipher.login.username && cipher.login.username !== '')) {
            await this.contextMenusCreate({
                type: 'normal',
                id: 'copy-username_' + idSuffix,
                parentId: 'copy-username',
                contexts: ['all'],
                title: title,
            });
        }

        if (cipher == null || (cipher.login.password && cipher.login.password !== '')) {
            await this.contextMenusCreate({
                type: 'normal',
                id: 'copy-password_' + idSuffix,
                parentId: 'copy-password',
                contexts: ['all'],
                title: title,
            });
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

    private doCheck(tab: any) {
        if (tab == null) {
            return;
        }

        const tabDomain = this.platformUtilsService.getDomain(tab.url);
        if (tabDomain == null) {
            return;
        }

        for (let i = 0; i < this.loginsToAdd.length; i++) {
            if (this.loginsToAdd[i].tabId !== tab.id || this.loginsToAdd[i].domain !== tabDomain) {
                continue;
            }

            BrowserApi.tabSendMessage(tab, 'openNotificationBar', {
                type: 'add',
            });
            break;
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

    private async actionSetIcon(theAction: any, suffix: string): Promise<any> {
        if (!theAction || !theAction.setIcon) {
            return;
        }

        const options = {
            path: {
                19: 'images/icon19' + suffix + '.png',
                38: 'images/icon38' + suffix + '.png',
            },
        };

        if (this.platformUtilsService.isFirefox()) {
            await theAction.setIcon(options);
        } else {
            return new Promise((resolve) => {
                theAction.setIcon(options, () => resolve());
            });
        }
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
}
