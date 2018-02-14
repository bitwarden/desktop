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

import { UpdaterMain } from './updater.main';
import { WindowMain } from './window.main';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';

export class MenuMain {
    constructor(private windowMain: WindowMain, private updaterMain: UpdaterMain,
        private i18nService: I18nService, private messagingService: MessagingService) { }

    init() {
        const template: MenuItemConstructorOptions[] = [
            {
                label: this.i18nService.t('file'),
                submenu: [
                    {
                        label: this.i18nService.t('addNewLogin'),
                        click: () => this.messagingService.send('newLogin'),
                        accelerator: 'CmdOrCtrl+N',
                    },
                    {
                        label: this.i18nService.t('addNewItem'),
                        submenu: [
                            {
                                label: this.i18nService.t('typeLogin'),
                                click: () => this.messagingService.send('newLogin'),
                                accelerator: 'Alt+L',
                            },
                            {
                                label: this.i18nService.t('typeCard'),
                                click: () => this.messagingService.send('newCard'),
                                accelerator: 'Alt+C',
                            },
                            {
                                label: this.i18nService.t('typeIdentity'),
                                click: () => this.messagingService.send('newIdentity'),
                                accelerator: 'Alt+I',
                            },
                            {
                                label: this.i18nService.t('typeSecureNote'),
                                click: () => this.messagingService.send('newSecureNote'),
                                accelerator: 'Alt+S',
                            },
                        ],
                    },
                    {
                        label: this.i18nService.t('addNewFolder'),
                        click: () => this.messagingService.send('newFolder'),
                    },
                    { type: 'separator' },
                    {
                        label: this.i18nService.t('syncVault'),
                        click: () => this.messagingService.send('syncVault'),
                    },
                ],
            },
            {
                label: this.i18nService.t('edit'),
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'selectall' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                ],
            },
            {
                label: this.i18nService.t('view'),
                submenu: [
                    {
                        label: this.i18nService.t('passwordGenerator'),
                        click: () => this.messagingService.send('openPasswordGenerator'),
                        accelerator: 'CmdOrCtrl+G',
                    },
                    {
                        label: this.i18nService.t('searchVault'),
                        click: () => this.messagingService.send('focusSearch'),
                        accelerator: 'CmdOrCtrl+F',
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
                label: this.i18nService.t('account'),
                submenu: [
                    {
                        label: this.i18nService.t('premiumMembership'),
                        click: () => this.messagingService.send('premiumMembership'),
                    },
                    {
                        label: this.i18nService.t('changeMasterPass'),
                        click: () => {
                            const result = dialog.showMessageBox(this.windowMain.win, {
                                title: this.i18nService.t('changeMasterPass'),
                                message: this.i18nService.t('changeMasterPasswordConfirmation'),
                                buttons: [this.i18nService.t('yes'), this.i18nService.t('no')],
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
                        label: this.i18nService.t('changeEmail'),
                        click: () => {
                            const result = dialog.showMessageBox(this.windowMain.win, {
                                title: this.i18nService.t('changeEmail'),
                                message: this.i18nService.t('changeEmailConfirmation'),
                                buttons: [this.i18nService.t('yes'), this.i18nService.t('no')],
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
                        label: this.i18nService.t('twoStepLogin'),
                        click: () => {
                            const result = dialog.showMessageBox(this.windowMain.win, {
                                title: this.i18nService.t('twoStepLogin'),
                                message: this.i18nService.t('twoStepLoginConfirmation'),
                                buttons: [this.i18nService.t('yes'), this.i18nService.t('no')],
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
                        label: this.i18nService.t('logOut'),
                        click: () => {
                            const result = dialog.showMessageBox(this.windowMain.win, {
                                title: this.i18nService.t('logOut'),
                                message: this.i18nService.t('logOutConfirmation'),
                                buttons: [this.i18nService.t('logOut'), this.i18nService.t('cancel')],
                                cancelId: 1,
                                defaultId: 0,
                                noLink: true,
                            });
                            if (result === 0) {
                                this.messagingService.send('logout');
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
                        label: this.i18nService.t('emailUs'),
                        click: () => shell.openExternal('mailTo:hello@bitwarden.com'),
                    },
                    {
                        label: this.i18nService.t('visitOurWebsite'),
                        click: () => shell.openExternal('https://bitwarden.com/contact'),
                    },
                    {
                        label: this.i18nService.t('fileBugReport'),
                        click: () => shell.openExternal('https://github.com/bitwarden/desktop'),
                    },
                    { type: 'separator' },
                    {
                        label: this.i18nService.t('followUs'),
                        submenu: [
                            {
                                label: this.i18nService.t('blog'),
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
                        label: this.i18nService.t('goToWebVault'),
                        click: () => shell.openExternal('https://vault.bitwarden.com'),
                    },
                    {
                        label: this.i18nService.t('getMobileApp'),
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
                        label: this.i18nService.t('getBrowserExtension'),
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
                label: this.i18nService.t('settings'),
                click: () => this.messagingService.send('openSettings'),
            },
            {
                label: this.i18nService.t('lockNow'),
                click: () => this.messagingService.send('lockVault'),
                accelerator: 'CmdOrCtrl+L',
            },
        ];

        const updateMenuItem = {
            label: this.i18nService.t('checkForUpdates'),
            click: () => this.updaterMain.checkForUpdate(true),
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
                        label: this.i18nService.t('about'),
                        click: () => {
                            const aboutInformation = this.i18nService.t('version', app.getVersion()) +
                                '\nShell ' + process.versions.electron +
                                '\nRenderer ' + process.versions.chrome +
                                '\nNode ' + process.versions.node +
                                '\nArchitecture ' + process.arch;
                            const result = dialog.showMessageBox(this.windowMain.win, {
                                title: 'Bitwarden',
                                message: 'Bitwarden',
                                detail: aboutInformation,
                                type: 'info',
                                noLink: true,
                                buttons: [this.i18nService.t('ok'), this.i18nService.t('copy')],
                            });
                            if (result === 1) {
                                clipboard.writeText(aboutInformation);
                            }
                        },
                    },
                ]);
        }

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }
}
