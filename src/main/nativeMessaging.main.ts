import { promises as fs, existsSync } from 'fs';
import * as ipc from 'node-ipc';
import * as path from 'path';
import * as util from 'util';
import { homedir, userInfo } from 'os';

import { LogService } from 'jslib/abstractions/log.service';
import { ipcMain } from 'electron';
import { WindowMain } from 'jslib/electron/window.main';

export class NativeMessagingMain {
    private connected = false;
    private socket: any;

    constructor(private logService: LogService, private windowMain: WindowMain, private userPath: string, private appPath: string) {}

    listen() {
        ipc.config.id = 'bitwarden';
        ipc.config.retry = 1500;
        if (process.platform === 'darwin') {
            ipc.config.socketRoot = path.join(homedir(), 'tmp');
        }

        ipc.serve(() => {
            ipc.server.on('message', (data: any, socket: any) => {
                this.socket = socket;
                this.windowMain.win.webContents.send('nativeMessaging', data);
            });

            ipcMain.on('nativeMessagingReply', (event, msg) => {
                if (this.socket != null && msg != null) {
                    this.send(msg, this.socket);
                }
            })

            ipc.server.on('connect', () => {
                this.connected = true;
            })

            ipc.server.on(
                'socket.disconnected',
                (socket: any, destroyedSocketID: any) => {
                    this.connected = false;
                    this.socket = null;
                    ipc.log(
                        'client ' + destroyedSocketID + ' has disconnected!'
                    );
                }
            );
        });

        ipc.server.start();
    }

    stop() {
        ipc.server.stop();
    }

    send(message: object, socket: any) {
        ipc.server.emit(socket, 'message', message);
    }

    generateManifests() {
        const baseJson = {
            'name': 'com.8bit.bitwarden',
            'description': 'Bitwarden desktop <-> browser bridge',
            'path': this.binaryPath(),
            'type': 'stdio',
        }

        const firefoxJson = {...baseJson, ...{ 'allowed_extensions': ['{446900e4-71c2-419f-a6a7-df9c091e268b}']}};
        const chromeJson = {...baseJson, ...{
            'allowed_origins': [
                'chrome-extension://nngceckbapebfimnlniiiahkandclblb/',
                'chrome-extension://jbkfoedolllekgbhcbcoahefnbanhhlh/',
                'chrome-extension://ccnckbpmaceehanjmeomladnmlffdjgn/'
            ]
        }};

        switch (process.platform) {
            case 'win32':
                const destination = path.join(this.userPath, 'browsers');
                this.writeManifest(path.join(destination, 'firefox.json'), firefoxJson);
                this.writeManifest(path.join(destination, 'chrome.json'), chromeJson);

                this.createWindowsRegistry('HKLM\\SOFTWARE\\Mozilla\\Firefox', 'HKCU\\SOFTWARE\\Mozilla\\NativeMessagingHosts\\com.8bit.bitwarden', path.join(destination, 'firefox.json'));
                this.createWindowsRegistry('HKCU\\SOFTWARE\\Google\\Chrome', 'HKCU\\SOFTWARE\\Google\\Chrome\\NativeMessagingHosts\\com.8bit.bitwarden', path.join(destination, 'chrome.json'));
                break;
            case 'darwin':
                if (existsSync(`${this.homedir()}/Library/Application\ Support/Mozilla/NativeMessagingHosts/`)) {
                    this.writeManifest(`${this.homedir()}/Library/Application\ Support/Mozilla/NativeMessagingHosts/com.8bit.bitwarden.json`, firefoxJson);
                } else {
                    this.logService.warning(`Firefox not found skipping.`);
                }

                if (existsSync(`${this.homedir()}/Library/Application\ Support/Google/Chrome/NativeMessagingHosts`)) {
                    this.writeManifest(`${this.homedir()}/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.8bit.bitwarden.json`, chromeJson);
                } else {
                    this.logService.warning(`Chrome not found skipping.`);
                }
                break;
            case 'linux':
                if (existsSync(`${this.homedir()}/.mozilla/`)) {
                    this.writeManifest(`${this.homedir()}/.mozilla/native-messaging-hosts/com.8bit.bitwarden.json`, firefoxJson);
                }

                if (existsSync(`${this.homedir()}/.config/google-chrome/`)) {
                    this.writeManifest(`${this.homedir()}/.config/google-chrome/NativeMessagingHosts/com.8bit.bitwarden.json`, chromeJson);
                }
                break;
            default:
                break;
        }
    }

    removeManifests() {
        switch (process.platform) {
            case 'win32':
                fs.unlink(path.join(this.userPath, 'browsers', 'firefox.json'));
                fs.unlink(path.join(this.userPath, 'browsers', 'chrome.json'));
                this.deleteWindowsRegistry('HKCU\\SOFTWARE\\Mozilla\\NativeMessagingHosts\\com.8bit.bitwarden');
                this.deleteWindowsRegistry('HKCU\\SOFTWARE\\Google\\Chrome\\NativeMessagingHosts\\com.8bit.bitwarden');
                break;
            case 'darwin':
                if (existsSync(`${this.homedir()}/Library/Application\ Support/Mozilla/NativeMessagingHosts/com.8bit.bitwarden.json`)) {
                    fs.unlink(`${this.homedir()}/Library/Application\ Support/Mozilla/NativeMessagingHosts/com.8bit.bitwarden.json`);
                }

                if (existsSync(`${this.homedir()}/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.8bit.bitwarden.json`)) {
                    fs.unlink(`${this.homedir()}/Library/Application\ Support/Mozilla/NativeMessagingHosts/com.8bit.bitwarden.json`);
                }
                break;
            case 'linux':
                if (existsSync(`${this.homedir()}/.mozilla/native-messaging-hosts/com.8bit.bitwarden.json`)) {
                    fs.unlink(`${this.homedir()}/.mozilla/native-messaging-hosts/com.8bit.bitwarden.json`);
                }

                if (existsSync(`${this.homedir()}/.config/google-chrome/NativeMessagingHosts/com.8bit.bitwarden.json`)) {
                    fs.unlink(`${this.homedir()}/.config/google-chrome/NativeMessagingHosts/com.8bit.bitwarden.json`);
                }
                break;
            default:
                break;
        }
    }

    private writeManifest(destination: string, manifest: object) {
        fs.mkdir(path.dirname(destination));
        fs.writeFile(destination, JSON.stringify(manifest, null, 2)).catch(this.logService.error);
    }

    private binaryPath() {
        const dir = path.join(this.appPath, '..');
        if (process.platform === 'win32') {
            return path.join(dir, 'native-messaging.bat');
        } else if (process.platform === 'darwin') {
            return '/Applications/Bitwarden.app/Contents/MacOS/Bitwarden';
        }

        return path.join(dir, '..', 'bitwarden');
    }

    private async createWindowsRegistry(check: string, location: string, jsonFile: string) {
        const regedit = require('regedit');
        regedit.setExternalVBSLocation('resources/regedit/vbs');

        const list = util.promisify(regedit.list);
        const createKey = util.promisify(regedit.createKey);
        const putValue = util.promisify(regedit.putValue);

        this.logService.debug(`Adding registry: ${location}`)

        // Check installed
        try {
            await list(check)
        } catch {
            this.logService.warning(`Not finding registry ${check} skipping.`);
            return;
        }

        try {
            await createKey(location);

            // Insert path to manifest
            const obj: any = {};
            obj[location] = {
                'default': {
                    value: jsonFile,
                    type: 'REG_DEFAULT',
                },
            }

            return putValue(obj);
        } catch (error) {
            this.logService.error(error);
        }
    }

    private async deleteWindowsRegistry(key: string) {
        const regedit = require('regedit');

        const list = util.promisify(regedit.list);
        const deleteKey = util.promisify(regedit.deleteKey);

        this.logService.debug(`Removing registry: ${key}`)

        try {
            await list(key);
            await deleteKey(key);
        } catch {
            // Do nothing
        }
    }

    private homedir() {
        if (process.platform === 'darwin') {
            return userInfo().homedir;
        } else {
            return homedir();
        }
    }
}
