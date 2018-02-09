import {
    app,
    BrowserWindow,
    Menu,
    MenuItemConstructorOptions,
    ipcMain,
} from 'electron';

import { WindowMain } from './window.main';

import { I18nService } from '../services/i18n.service';

export class MenuMain {
    constructor(private windowMain: WindowMain, private i18nService: I18nService) { }

    init() {
        const self = this;

        const template: MenuItemConstructorOptions[] = [
            {
                label: 'File',
                submenu: [
                    {
                        label: this.i18nService.t('addNewLogin'),
                        click() {
                            self.send('newLogin');
                        },
                        accelerator: 'CmdOrCtrl+N'
                    },
                    {
                        label: this.i18nService.t('addNewItem'),
                        submenu: [
                            {
                                label: this.i18nService.t('typeLogin'),
                                click() {
                                    self.send('newLogin');
                                }
                            },
                            {
                                label: this.i18nService.t('typeCard'),
                                click() {
                                    self.send('newCard');
                                }
                            },
                            {
                                label: this.i18nService.t('typeIdentity'),
                                click() {
                                    self.send('newIdentity');
                                }
                            },
                            {
                                label: this.i18nService.t('typeSecureNote'),
                                click() {
                                    self.send('newSecureNote');
                                }
                            }
                        ]
                    },
                    { type: 'separator' },
                    {
                        label: this.i18nService.t('addNewFolder'),
                        click() {
                            self.send('newFolder');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: this.i18nService.t('settings'),
                        click() {
                            self.send('openSettings');
                        }
                    },
                    {
                        label: 'Lock',
                        click() {
                            self.send('lockApp');
                        },
                        accelerator: 'CmdOrCtrl+L'
                    },
                ]
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
                ]
            },
            {
                label: this.i18nService.t('view'),
                submenu: [
                    { role: 'reload' },
                    { role: 'forcereload' },
                    { role: 'toggledevtools' },
                    { type: 'separator' },
                    {
                        role: 'resetzoom',
                        accelerator: 'CmdOrCtrl+0' },
                    {
                        role: 'zoomin',
                        accelerator: 'CmdOrCtrl+=' },
                    {
                        role: 'zoomout',
                        accelerator: 'CmdOrCtrl+-'
                    },
                    { type: 'separator' },
                    { role: 'togglefullscreen' }
                ]
            },
            {
                label: this.i18nService.t('account'),
                submenu: [
                    {
                        label: this.i18nService.t('logOut'),
                        click() {
                            self.send('confirmLogout');
                        }
                    },
                ]
            },
            {
                role: 'window',
                submenu: [
                    { role: 'minimize' },
                    { role: 'close' }
                ]
            },
            {
                role: 'help',
                submenu: [
                    {
                        label: 'Learn More',
                        click() { require('electron').shell.openExternal('https://electronjs.org') }
                    }
                ]
            }
        ];

        if (process.platform === 'darwin') {
            template[0].label = app.getName();
            (template[0].submenu as MenuItemConstructorOptions[]).concat([
                { type: 'separator' },
                { role: 'about' },
                { type: 'separator' },
                { role: 'services', submenu: [] },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]);

            // Window menu
            template[4].submenu = [
                { role: 'close' },
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' }
            ]
        }

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    send(command: string, message?: any) {
        this.windowMain.win.webContents.send('messagingService', {
            command: command,
            message: message,
        });
    }
}
