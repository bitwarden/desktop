import {
    app,
    BrowserWindow,
    clipboard,
    dialog,
    ipcMain,
    Menu,
    MenuItem,
    MenuItemConstructorOptions,
    shell,
} from 'electron';

import { Main } from '../main';

import { BaseMenu } from 'jslib/electron/baseMenu';

import { isMacAppStore, isSnapStore, isWindowsStore } from 'jslib/electron/utils';

import { ConstantsService } from 'jslib/services/constants.service';

export class MenuMain extends BaseMenu {
    menu: Menu;
    updateMenuItem: MenuItem;
    addNewLogin: MenuItem;
    addNewItem: MenuItem;
    addNewFolder: MenuItem;
    syncVault: MenuItem;
    exportVault: MenuItem;
    settings: MenuItem;
    lockNow: MenuItem;
    logOut: MenuItem;
    twoStepLogin: MenuItem;
    fingerprintPhrase: MenuItem;
    changeMasterPass: MenuItem;
    premiumMembership: MenuItem;
    passwordGenerator: MenuItem;
    passwordHistory: MenuItem;
    searchVault: MenuItem;
    copyUsername: MenuItem;
    copyPassword: MenuItem;
    copyTotp: MenuItem;
    unlockedRequiredMenuItems: MenuItem[] = [];

    constructor(private main: Main) {
        super(main.i18nService, main.windowMain);
    }

    init() {
        this.initProperties();
        this.initContextMenu();
        this.initApplicationMenu();

        this.updateMenuItem = this.menu.getMenuItemById('checkForUpdates');
        this.addNewLogin = this.menu.getMenuItemById('addNewLogin');
        this.addNewItem = this.menu.getMenuItemById('addNewItem');
        this.addNewFolder = this.menu.getMenuItemById('addNewFolder');
        this.syncVault = this.menu.getMenuItemById('syncVault');
        this.exportVault = this.menu.getMenuItemById('exportVault');
        this.settings = this.menu.getMenuItemById('settings');
        this.lockNow = this.menu.getMenuItemById('lockNow');
        this.logOut = this.menu.getMenuItemById('logOut');
        this.twoStepLogin = this.menu.getMenuItemById('twoStepLogin');
        this.fingerprintPhrase = this.menu.getMenuItemById('fingerprintPhrase');
        this.changeMasterPass = this.menu.getMenuItemById('changeMasterPass');
        this.premiumMembership = this.menu.getMenuItemById('premiumMembership');
        this.passwordGenerator = this.menu.getMenuItemById('passwordGenerator');
        this.passwordHistory = this.menu.getMenuItemById('passwordHistory');
        this.searchVault = this.menu.getMenuItemById('searchVault');
        this.copyUsername = this.menu.getMenuItemById('copyUsername');
        this.copyPassword = this.menu.getMenuItemById('copyPassword');
        this.copyTotp = this.menu.getMenuItemById('copyTotp');

        this.unlockedRequiredMenuItems = [
            this.addNewLogin, this.addNewItem, this.addNewFolder,
            this.syncVault, this.exportVault, this.settings, this.lockNow, this.twoStepLogin, this.fingerprintPhrase,
            this.changeMasterPass, this.premiumMembership, this.passwordGenerator, this.passwordHistory,
            this.searchVault, this.copyUsername, this.copyPassword];
        this.updateApplicationMenuState(false, true);
    }

    updateApplicationMenuState(isAuthenticated: boolean, isLocked: boolean) {
        this.unlockedRequiredMenuItems.forEach((mi: MenuItem) => {
            if (mi != null) {
                mi.enabled = isAuthenticated && !isLocked;
            }
        });

        if (this.menu != null) {
            Menu.setApplicationMenu(this.menu);
        }

        if (this.logOut != null) {
            this.logOut.enabled = isAuthenticated;
        }
    }

    private initApplicationMenu() {
        const accountSubmenu: MenuItemConstructorOptions[] = [
            {
                label: this.main.i18nService.t('changeMasterPass'),
                id: 'changeMasterPass',
                click: async () => {
                    const result = await dialog.showMessageBox(this.main.windowMain.win, {
                        title: this.main.i18nService.t('changeMasterPass'),
                        message: this.main.i18nService.t('changeMasterPass'),
                        detail: this.main.i18nService.t('changeMasterPasswordConfirmation'),
                        buttons: [this.main.i18nService.t('yes'), this.main.i18nService.t('no')],
                        cancelId: 1,
                        defaultId: 0,
                        noLink: true,
                    });
                    if (result.response === 0) {
                        await this.openWebVault();
                    }
                },
            },
            {
                label: this.main.i18nService.t('twoStepLogin'),
                id: 'twoStepLogin',
                click: async () => {
                    const result = await dialog.showMessageBox(this.main.windowMain.win, {
                        title: this.main.i18nService.t('twoStepLogin'),
                        message: this.main.i18nService.t('twoStepLogin'),
                        detail: this.main.i18nService.t('twoStepLoginConfirmation'),
                        buttons: [this.main.i18nService.t('yes'), this.main.i18nService.t('no')],
                        cancelId: 1,
                        defaultId: 0,
                        noLink: true,
                    });
                    if (result.response === 0) {
                        await this.openWebVault();
                    }
                },
            },
            {
                label: this.main.i18nService.t('fingerprintPhrase'),
                id: 'fingerprintPhrase',
                click: () => this.main.messagingService.send('showFingerprintPhrase'),
            },
            { type: 'separator' },
            {
                label: this.i18nService.t('logOut'),
                id: 'logOut',
                click: async () => {
                    const result = await dialog.showMessageBox(this.windowMain.win, {
                        title: this.i18nService.t('logOut'),
                        message: this.i18nService.t('logOut'),
                        detail: this.i18nService.t('logOutConfirmation'),
                        buttons: [this.i18nService.t('logOut'), this.i18nService.t('cancel')],
                        cancelId: 1,
                        defaultId: 0,
                        noLink: true,
                    });
                    if (result.response === 0) {
                        this.main.messagingService.send('logout');
                    }
                },
            },
        ];

        this.editMenuItemOptions.submenu = (this.editMenuItemOptions.submenu as MenuItemConstructorOptions[]).concat([
            { type: 'separator' },
            {
                label: this.main.i18nService.t('copyUsername'),
                id: 'copyUsername',
                click: () => this.main.messagingService.send('copyUsername'),
                accelerator: 'CmdOrCtrl+U',
            },
            {
                label: this.main.i18nService.t('copyPassword'),
                id: 'copyPassword',
                click: () => this.main.messagingService.send('copyPassword'),
                accelerator: 'CmdOrCtrl+P',
            },
            {
                label: this.main.i18nService.t('copyVerificationCodeTotp'),
                id: 'copyTotp',
                click: () => this.main.messagingService.send('copyTotp'),
                accelerator: 'CmdOrCtrl+T',
            },
        ]);

        if (!isWindowsStore() && !isMacAppStore()) {
            accountSubmenu.unshift({
                label: this.main.i18nService.t('premiumMembership'),
                click: () => this.main.messagingService.send('openPremium'),
                id: 'premiumMembership',
            });
        }

        let helpSubmenu: MenuItemConstructorOptions[] = [
            {
                label: this.main.i18nService.t('emailUs'),
                click: () => shell.openExternal('mailTo:hello@bitwarden.com'),
            },
            {
                label: this.main.i18nService.t('visitOurWebsite'),
                click: () => shell.openExternal('https://bitwarden.com/contact'),
            },
            {
                label: this.main.i18nService.t('fileBugReport'),
                click: () => shell.openExternal('https://github.com/bitwarden/desktop'),
            },
        ];

        if (isMacAppStore()) {
            helpSubmenu.push({
                label: this.main.i18nService.t('legal'),
                submenu: [
                    {
                        label: this.main.i18nService.t('termsOfService'),
                        click: () => shell.openExternal('https://bitwarden.com/terms/'),
                    },
                    {
                        label: this.main.i18nService.t('privacyPolicy'),
                        click: () => shell.openExternal('https://bitwarden.com/privacy/'),
                    },
                ],
            });
        }

        helpSubmenu = helpSubmenu.concat([
            { type: 'separator' },
            {
                label: this.main.i18nService.t('followUs'),
                submenu: [
                    {
                        label: this.main.i18nService.t('blog'),
                        click: () => shell.openExternal('https://blog.bitwarden.com'),
                    },
                    {
                        label: 'Twitter',
                        click: () => shell.openExternal('https://twitter.com/bitwarden'),
                    },
                    {
                        label: 'Facebook',
                        click: () => shell.openExternal('https://www.facebook.com/bitwarden/'),
                    },
                    {
                        label: 'GitHub',
                        click: () => shell.openExternal('https://github.com/bitwarden'),
                    },
                ],
            },
            { type: 'separator' },
            {
                label: this.main.i18nService.t('goToWebVault'),
                click: async () => await this.openWebVault(),
            },
        ]);

        if (!isWindowsStore()) {
            helpSubmenu.push({
                label: this.main.i18nService.t('getMobileApp'),
                submenu: [
                    {
                        label: 'iOS',
                        click: () => {
                            shell.openExternal('https://itunes.apple.com/app/' +
                                'bitwarden-free-password-manager/id1137397744?mt=8');
                        },
                    },
                    {
                        label: 'Android',
                        click: () => {
                            shell.openExternal('https://play.google.com/store/apps/' +
                                'details?id=com.x8bit.bitwarden');
                        },
                    },
                ],
            });
            helpSubmenu.push({
                label: this.main.i18nService.t('getBrowserExtension'),
                submenu: [
                    {
                        label: 'Chrome',
                        click: () => {
                            shell.openExternal('https://chrome.google.com/webstore/detail/' +
                                'bitwarden-free-password-m/nngceckbapebfimnlniiiahkandclblb');
                        },
                    },
                    {
                        label: 'Firefox',
                        click: () => {
                            shell.openExternal('https://addons.mozilla.org/firefox/addon/' +
                                'bitwarden-password-manager/');
                        },
                    },
                    {
                        label: 'Opera',
                        click: () => {
                            shell.openExternal('https://addons.opera.com/extensions/details/' +
                                'bitwarden-free-password-manager/');
                        },
                    },
                    {
                        label: 'Edge',
                        click: () => {
                            shell.openExternal('https://www.microsoft.com/store/p/' +
                                'bitwarden-free-password-manager/9p6kxl0svnnl');
                        },
                    },
                    {
                        label: 'Safari',
                        click: () => {
                            shell.openExternal('https://bitwarden.com/download/');
                        },
                    },
                ],
            });
        }

        const template: MenuItemConstructorOptions[] = [
            {
                label: this.main.i18nService.t('file'),
                submenu: [
                    {
                        label: this.main.i18nService.t('addNewLogin'),
                        click: () => this.main.messagingService.send('newLogin'),
                        accelerator: 'CmdOrCtrl+N',
                        id: 'addNewLogin',
                    },
                    {
                        label: this.main.i18nService.t('addNewItem'),
                        id: 'addNewItem',
                        submenu: [
                            {
                                label: this.main.i18nService.t('typeLogin'),
                                click: () => this.main.messagingService.send('newLogin'),
                                accelerator: 'CmdOrCtrl+Shift+L',
                            },
                            {
                                label: this.main.i18nService.t('typeCard'),
                                click: () => this.main.messagingService.send('newCard'),
                                accelerator: 'CmdOrCtrl+Shift+C',
                            },
                            {
                                label: this.main.i18nService.t('typeIdentity'),
                                click: () => this.main.messagingService.send('newIdentity'),
                                accelerator: 'CmdOrCtrl+Shift+I',
                            },
                            {
                                label: this.main.i18nService.t('typeSecureNote'),
                                click: () => this.main.messagingService.send('newSecureNote'),
                                accelerator: 'CmdOrCtrl+Shift+S',
                            },
                        ],
                    },
                    {
                        label: this.main.i18nService.t('addNewFolder'),
                        id: 'addNewFolder',
                        click: () => this.main.messagingService.send('newFolder'),
                    },
                    { type: 'separator' },
                    {
                        label: this.main.i18nService.t('syncVault'),
                        id: 'syncVault',
                        click: () => this.main.messagingService.send('syncVault'),
                    },
                    {
                        label: this.main.i18nService.t('exportVault'),
                        id: 'exportVault',
                        click: () => this.main.messagingService.send('exportVault'),
                    },
                ],
            },
            this.editMenuItemOptions,
            {
                label: this.main.i18nService.t('view'),
                submenu: ([
                    {
                        label: this.main.i18nService.t('searchVault'),
                        id: 'searchVault',
                        click: () => this.main.messagingService.send('focusSearch'),
                        accelerator: 'CmdOrCtrl+F',
                    },
                    { type: 'separator' },
                    {
                        label: this.main.i18nService.t('passwordGenerator'),
                        id: 'passwordGenerator',
                        click: () => this.main.messagingService.send('openPasswordGenerator'),
                        accelerator: 'CmdOrCtrl+G',
                    },
                    {
                        label: this.main.i18nService.t('passwordHistory'),
                        id: 'passwordHistory',
                        click: () => this.main.messagingService.send('openPasswordHistory'),
                    },
                    { type: 'separator' },
                ] as MenuItemConstructorOptions[]).concat(this.viewSubMenuItemOptions),
            },
            {
                label: this.main.i18nService.t('account'),
                submenu: accountSubmenu,
            },
            this.windowMenuItemOptions,
            {
                label: this.main.i18nService.t('help'),
                role: 'help',
                submenu: helpSubmenu,
            },
        ];

        const firstMenuOptions: MenuItemConstructorOptions[] = [
            { type: 'separator' },
            {
                label: this.main.i18nService.t(process.platform === 'darwin' ? 'preferences' : 'settings'),
                id: 'settings',
                click: () => this.main.messagingService.send('openSettings'),
                accelerator: 'CmdOrCtrl+,',
            },
            {
                label: this.main.i18nService.t('lockNow'),
                id: 'lockNow',
                click: () => this.main.messagingService.send('lockVault'),
                accelerator: 'CmdOrCtrl+L',
            },
        ];

        const updateMenuItem = {
            label: this.main.i18nService.t('checkForUpdates'),
            click: () => this.main.updaterMain.checkForUpdate(true),
            id: 'checkForUpdates',
        };

        if (process.platform === 'darwin') {
            const firstMenuPart: MenuItemConstructorOptions[] = [
                {
                    label: this.main.i18nService.t('aboutBitwarden'),
                    role: 'about',
                },
            ];

            if (!isMacAppStore()) {
                firstMenuPart.push(updateMenuItem);
            }

            template.unshift({
                label: 'Bitwarden',
                submenu: firstMenuPart.concat(firstMenuOptions, [
                    { type: 'separator' },
                ], this.macAppMenuItemOptions),
            });

            // Window menu
            template[template.length - 2].submenu = this.macWindowSubmenuOptions;
        } else {
            // File menu
            template[0].submenu = (template[0].submenu as MenuItemConstructorOptions[]).concat(
                firstMenuOptions, {
                label: this.i18nService.t('quitBitwarden'),
                role: 'quit',
            });

            // About menu
            const aboutMenuAdditions: MenuItemConstructorOptions[] = [
                { type: 'separator' },
            ];

            if (!isWindowsStore() && !isSnapStore()) {
                aboutMenuAdditions.push(updateMenuItem);
            }

            aboutMenuAdditions.push({
                label: this.i18nService.t('aboutBitwarden'),
                click: async () => {
                    const aboutInformation = this.i18nService.t('version', app.getVersion()) +
                        '\nShell ' + process.versions.electron +
                        '\nRenderer ' + process.versions.chrome +
                        '\nNode ' + process.versions.node +
                        '\nArchitecture ' + process.arch;
                    const result = await dialog.showMessageBox(this.windowMain.win, {
                        title: 'Bitwarden',
                        message: 'Bitwarden',
                        detail: aboutInformation,
                        type: 'info',
                        noLink: true,
                        buttons: [this.i18nService.t('ok'), this.i18nService.t('copy')],
                    });
                    if (result.response === 1) {
                        clipboard.writeText(aboutInformation);
                    }
                },
            });

            template[template.length - 1].submenu =
                (template[template.length - 1].submenu as MenuItemConstructorOptions[]).concat(aboutMenuAdditions);
        }

        (template[template.length - 2].submenu as MenuItemConstructorOptions[]).splice(1, 0,
            {
                label: this.main.i18nService.t(process.platform === 'darwin' ? 'hideToMenuBar' : 'hideToTray'),
                click: () => this.main.messagingService.send('hideToTray'),
                accelerator: 'CmdOrCtrl+Shift+M',
            },
            {
                type: 'checkbox',
                label: this.main.i18nService.t('alwaysOnTop'),
                checked: this.windowMain.win.isAlwaysOnTop(),
                click: () => this.main.windowMain.toggleAlwaysOnTop(),
                accelerator: 'CmdOrCtrl+Shift+T',
            });
        this.menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(this.menu);
    }

    private async openWebVault() {
        let webUrl = 'https://vault.bitwarden.com';
        const urlsObj: any = await this.main.storageService.get(ConstantsService.environmentUrlsKey);
        if (urlsObj != null) {
            if (urlsObj.base != null) {
                webUrl = urlsObj.base;
            } else if (urlsObj.webVault != null) {
                webUrl = urlsObj.webVault;
            }
        }
        shell.openExternal(webUrl);
    }
}
