import {
    app,
    BrowserWindow,
    Menu,
    MenuItemConstructorOptions,
    ipcMain,
} from 'electron';

import { WindowMain } from './window.main';

export class MenuMain {
    constructor(private windowMain: WindowMain) { }

    init() {
        const self = this;

        const template: MenuItemConstructorOptions[] = [
            {
                label: 'bitwarden'
            },
            {
                label: 'File',
                submenu: [
                    {
                        label: 'New Item',
                        submenu: [
                            {
                                label: 'New Login',
                                click() {
                                    self.send('newLogin');
                                }
                            },
                            {
                                label: 'New Card',
                                click() {
                                    self.send('newCard');
                                }
                            },
                            {
                                label: 'New Identity',
                                click() {
                                    self.send('newIdentity');
                                }
                            },
                            {
                                label: 'New Secure Note',
                                click() {
                                    self.send('newSecureNote');
                                }
                            }
                        ]
                    },
                    {
                        label: 'New Login',
                        click() {
                            self.send('newLogin');
                        }
                    },
                    {
                        label: 'New Folder',
                        click() {
                            self.send('newFolder');
                        }
                    }
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    { role: 'pasteandmatchstyle' },
                    { role: 'delete' },
                    { role: 'selectall' }
                ]
            },
            {
                label: 'View',
                submenu: [
                    { role: 'reload' },
                    { role: 'forcereload' },
                    { role: 'toggledevtools' },
                    { type: 'separator' },
                    { role: 'resetzoom' },
                    { role: 'zoomin' },
                    { role: 'zoomout' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' }
                ]
            },
            {
                label: 'Account',
                submenu: [
                    {
                        label: 'Log Out',
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
            template[0].submenu = [
                {
                    label: 'Settings',
                    click() {
                        self.send('openSettings');
                    }
                },
                {
                    label: 'Lock',
                    click() {
                        self.send('lockApp');
                    }
                },
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
            ];

            // Window menu
            template[4].submenu = [
                { role: 'close' },
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' }
            ]
        } else {
            template[0].submenu = [
                {
                    label: 'Settings',
                    click() {
                        self.send('openSettings');
                    }
                },
                {
                    label: 'Lock',
                    click() {
                        self.send('lockApp');
                    }
                },
            ];
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
