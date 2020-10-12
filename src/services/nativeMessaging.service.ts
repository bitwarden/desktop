import { promises as fs, existsSync } from 'fs';
import * as ipc from 'node-ipc';
import * as path from 'path';
import * as util from 'util';

import { LogService } from 'jslib/abstractions/log.service';
import { BiometricMain } from 'jslib/abstractions/biometric.main';

export class NativeMessagingService {
    private connected = false;

    constructor(private logService: LogService, private biometricMain: BiometricMain, private userPath: string, private appPath: string) {}

    listen() {
        ipc.config.id = 'bitwarden';
        ipc.config.retry = 1500;

        ipc.serve(() => {
            ipc.server.on('message', (data: any, socket: any) => {
                this.messageHandler(data, socket);
            });

            ipc.server.on('connect', () => {
                this.connected = true;
            })

            ipc.server.on(
                'socket.disconnected',
                (socket: any, destroyedSocketID: any) => {
                    this.connected = false;
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
            'path': path.join(this.appPath, 'proxys', this.binaryName()),
            'type': 'stdio',
        }

        const firefoxJson = {...baseJson, ...{ 'allowed_origins': ['446900e4-71c2-419f-a6a7-df9c091e268b']}}
        const chromeJson = {...baseJson, ...{ 'allowed_origins': ['chrome-extension://ijeheppnniijonkinoakkofcdhdfojda/']}}

        if (!existsSync(path.join(this.userPath, 'browsers'))) {
            fs.mkdir(path.join(this.userPath, 'browsers'))
                .catch(this.logService.error)
        }

        switch (process.platform) {
            case 'win32':
                const destination = path.join(this.userPath, 'browsers')
                this.writeManifest(path.join(destination, 'firefox.json'), firefoxJson);
                this.writeManifest(path.join(destination, 'chrome.json'), chromeJson);

                this.createWindowsRegistry('HKLM\\SOFTWARE\\Mozilla\\Firefox', 'HKCU\\SOFTWARE\\Mozilla\\NativeMessagingHosts\\com.8bit.bitwarden', path.join(destination, 'firefox.json'))
                this.createWindowsRegistry('HKCU\\SOFTWARE\\Google\\Chrome', 'HKCU\\SOFTWARE\\Google\\Chrome\\NativeMessagingHosts\\com.8bit.bitwarden', path.join(destination, 'chrome.json'))
                break;
            case 'darwin':
                if (existsSync('~/Library/Application Support/Mozilla/')) {
                    fs.mkdir('~/Library/Application Support/Mozilla/NativeMessagingHosts/');
                    this.writeManifest('~/Library/Application Support/Mozilla/NativeMessagingHosts/com.8bit.bitwarden.json', firefoxJson);
                }

                if (existsSync('~/Library/Application Support/Google/Chrome/')) {
                    fs.mkdir('~/Library/Application Support/Google/Chrome/NativeMessagingHosts/');
                    this.writeManifest('~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.8bit.bitwarden.json', chromeJson);
                }
                break;
            case 'linux':
                if (existsSync('~/.mozilla/')) {
                    fs.mkdir('~/.mozilla/native-messaging-hosts');
                    this.writeManifest('~/.mozilla/native-messaging-hosts/com.8bit.bitwarden.json', firefoxJson);
                }

                if (existsSync('~/.config/google-chrome/')) {
                    fs.mkdir('~/.config/google-chrome/NativeMessagingHosts/');
                    this.writeManifest('~/.config/google-chrome/NativeMessagingHosts/com.8bit.bitwarden.json', chromeJson);
                }
                break;
            default:
                break;
        }
    }

    removeManifests() {
        switch (process.platform) {
            case 'win32':
                this.deleteWindowsRegistry('HKCU\\SOFTWARE\\Mozilla\\NativeMessagingHosts\\com.8bit.bitwarden');
                this.deleteWindowsRegistry('HKCU\\SOFTWARE\\Google\\Chrome\\NativeMessagingHosts\\com.8bit.bitwarden');
                break;
            case 'darwin':
                if (existsSync('~/Library/Application Support/Mozilla/NativeMessagingHosts/com.8bit.bitwarden.json')) {
                    fs.unlink('~/Library/Application Support/Mozilla/NativeMessagingHosts/com.8bit.bitwarden.json')
                }

                if (existsSync('~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.8bit.bitwarden.json')) {
                    fs.unlink('~/Library/Application Support/Mozilla/NativeMessagingHosts/com.8bit.bitwarden.json')
                }
                break;
            case 'linux':
                if (existsSync('~/.mozilla/native-messaging-hosts/com.8bit.bitwarden.json')) {
                    fs.unlink('~/.mozilla/native-messaging-hosts/com.8bit.bitwarden.json')
                }

                if (existsSync('~/.config/google-chrome/NativeMessagingHosts/com.8bit.bitwarden.json')) {
                    fs.unlink('~/.config/google-chrome/NativeMessagingHosts/com.8bit.bitwarden.json')
                }
                break;
            default:
                break;
        }
    }

    private writeManifest(destination: string, manifest: object) {
        fs.writeFile(destination, JSON.stringify(manifest, null, 2)).catch(this.logService.error);
    }

    private binaryName() {
        switch (process.platform) {
            case 'win32':
                return 'app-win.exe'
            case 'darwin':
                return 'app-linux'
            case 'linux':
            default:
                return 'app-macos'
        }
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

    private async messageHandler(message: any, socket: any) {
        switch (message.command) {
            case 'biometricUnlock':
                if (! this.biometricMain) {
                    return this.send({command: 'biometricUnlock', response: 'not supported'}, socket)
                }

                const response = await this.biometricMain.requestCreate();
                if (response) {
                    this.send({command: 'biometricUnlock', response: 'unlocked'}, socket);
                } else {
                    this.send({command: 'biometricUnlock', response: 'canceled'}, socket);
                }

                break;
            default:
                console.error('UNKNOWN COMMAND')
        }
    }
}
