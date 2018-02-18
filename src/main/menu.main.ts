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

export class MenuMain {
    menu: Menu;
    updateMenuItem: MenuItem;
    addNewLogin: MenuItem;
    addNewItem: MenuItem;
    addNewFolder: MenuItem;
    syncVault: MenuItem;
    settings: MenuItem;
    lockNow: MenuItem;
    logOut: MenuItem;
    twoStepLogin: MenuItem;
    changeEmail: MenuItem;
    changeMasterPass: MenuItem;
    premiumMembership: MenuItem;
    passwordGenerator: MenuItem;
    passwordHistory: MenuItem;
    searchVault: MenuItem;
    unlockedRequiredMenuItems: MenuItem[] = [];

    constructor(private main: Main) { }

    init() {
        this.initContextMenu();
        this.initApplicationMenu();

        this.updateMenuItem = this.menu.getMenuItemById('checkForUpdates');
        this.addNewLogin = this.menu.getMenuItemById('addNewLogin');
        this.addNewItem = this.menu.getMenuItemById('addNewItem');
        this.addNewFolder = this.menu.getMenuItemById('addNewFolder');
        this.syncVault = this.menu.getMenuItemById('syncVault');
        this.settings = this.menu.getMenuItemById('settings');
        this.lockNow = this.menu.getMenuItemById('lockNow');
        this.logOut = this.menu.getMenuItemById('logOut');
        this.twoStepLogin = this.menu.getMenuItemById('twoStepLogin');
        this.changeEmail = this.menu.getMenuItemById('changeEmail');
        this.changeMasterPass = this.menu.getMenuItemById('changeMasterPass');
        this.premiumMembership = this.menu.getMenuItemById('premiumMembership');
        this.passwordGenerator = this.menu.getMenuItemById('passwordGenerator');
        this.passwordHistory = this.menu.getMenuItemById('passwordHistory');
        this.searchVault = this.menu.getMenuItemById('searchVault');

        this.unlockedRequiredMenuItems = [
            this.addNewLogin, this.addNewItem, this.addNewFolder,
            this.syncVault, this.settings, this.lockNow, this.twoStepLogin, this.changeEmail,
            this.changeMasterPass, this.premiumMembership, this.passwordGenerator, this.passwordHistory,
            this.searchVault];
        this.updateApplicationMenuState(false, true);
    }

    updateApplicationMenuState(isAuthenticated: boolean, isLocked: boolean) {
        this.unlockedRequiredMenuItems.forEach((mi: MenuItem) => {
            mi.enabled = isAuthenticated && !isLocked;
        });

        this.logOut.enabled = isAuthenticated;
    }

    private initContextMenu() {
        if (this.main.windowMain.win == null) {
            return;
        }

        const selectionMenu = Menu.buildFromTemplate([
            { role: 'copy' },
            { type: 'separator' },
            { role: 'selectall' },
        ]);

        const inputMenu = Menu.buildFromTemplate([
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut', enabled: false },
            { role: 'copy', enabled: false },
            { role: 'paste' },
            { type: 'separator' },
            { role: 'selectall' },
        ]);

        const inputSelectionMenu = Menu.buildFromTemplate([
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { type: 'separator' },
            { role: 'selectall' },
        ]);

        this.main.windowMain.win.webContents.on('context-menu', (e, props) => {
            const selected = props.selectionText && props.selectionText.trim() !== '';
            if (props.isEditable && selected) {
                inputSelectionMenu.popup(this.main.windowMain.win);
            } else if (props.isEditable) {
                inputMenu.popup(this.main.windowMain.win);
            } else if (selected) {
                selectionMenu.popup(this.main.windowMain.win);
            }
        });
    }

    private initApplicationMenu() {
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
                                accelerator: 'Alt+L',
                            },
                            {
                                label: this.main.i18nService.t('typeCard'),
                                click: () => this.main.messagingService.send('newCard'),
                                accelerator: 'Alt+C',
                            },
                            {
                                label: this.main.i18nService.t('typeIdentity'),
                                click: () => this.main.messagingService.send('newIdentity'),
                                accelerator: 'Alt+I',
                            },
                            {
                                label: this.main.i18nService.t('typeSecureNote'),
                                click: () => this.main.messagingService.send('newSecureNote'),
                                accelerator: 'Alt+S',
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
                ],
            },
            {
                label: this.main.i18nService.t('edit'),
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    { type: 'separator' },
                    { role: 'selectall' },
                ],
            },
            {
                label: this.main.i18nService.t('view'),
                submenu: [
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
                    { role: 'zoomin', accelerator: 'CmdOrCtrl+=' },
                    { role: 'zoomout', accelerator: 'CmdOrCtrl+-' },
                    { role: 'resetzoom', accelerator: 'CmdOrCtrl+0' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' },
                    { type: 'separator' },
                    { role: 'reload', accelerator: 'Alt+Shift+R' },
                    { role: 'forcereload' },
                    { role: 'toggledevtools' },
                ],
            },
            {
                label: this.main.i18nService.t('account'),
                submenu: [
                    {
                        label: this.main.i18nService.t('premiumMembership'),
                        click: () => this.main.messagingService.send('openPremium'),
                        id: 'premiumMembership',
                    },
                    {
                        label: this.main.i18nService.t('changeMasterPass'),
                        id: 'changeMasterPass',
                        click: () => {
                            const result = dialog.showMessageBox(this.main.windowMain.win, {
                                title: this.main.i18nService.t('changeMasterPass'),
                                message: this.main.i18nService.t('changeMasterPass'),
                                detail: this.main.i18nService.t('changeMasterPasswordConfirmation'),
                                buttons: [this.main.i18nService.t('yes'), this.main.i18nService.t('no')],
                                cancelId: 1,
                                defaultId: 0,
                                noLink: true,
                            });
                            if (result === 0) {
                                shell.openExternal('https://vault.bitwarden.com');
                            }
                        },
                    },
                    {
                        label: this.main.i18nService.t('changeEmail'),
                        id: 'changeEmail',
                        click: () => {
                            const result = dialog.showMessageBox(this.main.windowMain.win, {
                                title: this.main.i18nService.t('changeEmail'),
                                message: this.main.i18nService.t('changeEmail'),
                                detail: this.main.i18nService.t('changeEmailConfirmation'),
                                buttons: [this.main.i18nService.t('yes'), this.main.i18nService.t('no')],
                                cancelId: 1,
                                defaultId: 0,
                                noLink: true,
                            });
                            if (result === 0) {
                                shell.openExternal('https://vault.bitwarden.com');
                            }
                        },
                    },
                    {
                        label: this.main.i18nService.t('twoStepLogin'),
                        id: 'twoStepLogin',
                        click: () => {
                            const result = dialog.showMessageBox(this.main.windowMain.win, {
                                title: this.main.i18nService.t('twoStepLogin'),
                                message: this.main.i18nService.t('twoStepLogin'),
                                detail: this.main.i18nService.t('twoStepLoginConfirmation'),
                                buttons: [this.main.i18nService.t('yes'), this.main.i18nService.t('no')],
                                cancelId: 1,
                                defaultId: 0,
                                noLink: true,
                            });
                            if (result === 0) {
                                shell.openExternal('https://vault.bitwarden.com');
                            }
                        },
                    },
                    { type: 'separator' },
                    {
                        label: this.main.i18nService.t('logOut'),
                        id: 'logOut',
                        click: () => {
                            const result = dialog.showMessageBox(this.main.windowMain.win, {
                                title: this.main.i18nService.t('logOut'),
                                message: this.main.i18nService.t('logOut'),
                                detail: this.main.i18nService.t('logOutConfirmation'),
                                buttons: [this.main.i18nService.t('logOut'), this.main.i18nService.t('cancel')],
                                cancelId: 1,
                                defaultId: 0,
                                noLink: true,
                            });
                            if (result === 0) {
                                this.main.messagingService.send('logout');
                            }
                        },
                    },
                ],
            },
            {
                role: 'window',
                submenu: [
                    { role: 'minimize' },
                    { role: 'close' },
                ],
            },
            {
                role: 'help',
                submenu: [
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
                                click: () => shell.openExternal('https://twitter.com/bitwarden_app'),
                            },
                            {
                                label: 'Facebook',
                                click: () => shell.openExternal('https://www.facebook.com/bitwarden/'),
                            },
                            {
                                label: 'Google+',
                                click: () => shell.openExternal('https://plus.google.com/114869903467947368993'),
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
                        click: () => shell.openExternal('https://vault.bitwarden.com'),
                    },
                    {
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
                    },
                    {
                        label: this.main.i18nService.t('getBrowserExtension'),
                        submenu: [
                            {
                                label: 'Chrome',
                                click: () => {
                                    shell.openExternal('https://chrome.google.com/webstore/detail/' +
                                        +'bitwarden-free-password-m/nngceckbapebfimnlniiiahkandclblb');
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
                                    shell.openExternal('https://safari-extensions.apple.com/details/' +
                                        '?id=com.bitwarden.safari-LTZ2PFU5D6');
                                },
                            },
                        ],
                    },
                ],
            },
        ];

        const firstMenuOptions: MenuItemConstructorOptions[] = [
            { type: 'separator' },
            {
                label: this.main.i18nService.t('settings'),
                id: 'settings',
                click: () => this.main.messagingService.send('openSettings'),
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
                { role: 'about' },
                updateMenuItem,
            ];

            template.unshift({
                label: 'Bitwarden',
                submenu: firstMenuPart.concat(firstMenuOptions, [
                    { type: 'separator' },
                    { role: 'services', submenu: [] },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'hideothers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' },
                ]),
            });

            // Window menu
            template[template.length - 2].submenu = [
                { role: 'close' },
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' },
            ];
        } else {
            // File menu
            template[0].submenu = (template[0].submenu as MenuItemConstructorOptions[]).concat(
                firstMenuOptions);

            // About menu
            template[template.length - 1].submenu =
                (template[template.length - 1].submenu as MenuItemConstructorOptions[]).concat([
                    { type: 'separator' },
                    updateMenuItem,
                    {
                        label: this.main.i18nService.t('about'),
                        click: () => {
                            const aboutInformation = this.main.i18nService.t('version', app.getVersion()) +
                                '\nShell ' + process.versions.electron +
                                '\nRenderer ' + process.versions.chrome +
                                '\nNode ' + process.versions.node +
                                '\nArchitecture ' + process.arch;
                            const result = dialog.showMessageBox(this.main.windowMain.win, {
                                title: 'Bitwarden',
                                message: 'Bitwarden',
                                detail: aboutInformation,
                                type: 'info',
                                noLink: true,
                                buttons: [this.main.i18nService.t('ok'), this.main.i18nService.t('copy')],
                            });
                            if (result === 1) {
                                clipboard.writeText(aboutInformation);
                            }
                        },
                    },
                ]);
        }

        this.menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(this.menu);
    }
}
