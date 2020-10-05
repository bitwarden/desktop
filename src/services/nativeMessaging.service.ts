import * as fs from 'fs';
import * as ipc from 'node-ipc';
import * as path from 'path';
import * as util from 'util';

export class NativeMessagingService {
    private connected = false;

    constructor(private userPath: string, private appPath: string) {}

    listen() {
        ipc.config.id = 'bitwarden';
        ipc.config.retry = 1500;

        ipc.serve(() => {
            ipc.server.on('message', (data: any, socket: any) => {
                ipc.log('got a message : ', data);
                ipc.server.emit(socket, 'message', data + ' world!');
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

    generateManifests() {
        const baseJson = {
            'name': 'com.8bit.bitwarden',
            'description': 'Bitwarden desktop <-> browser bridge',
            'path': path.join(this.appPath, 'proxys', this.binaryName()),
            'type': 'stdio',
        }

        const firefoxJson = {...baseJson, ...{ 'allowed_origins': ['446900e4-71c2-419f-a6a7-df9c091e268b']}}
        const chromeJson = {...baseJson, ...{ 'allowed_origins': ['chrome-extension://ijeheppnniijonkinoakkofcdhdfojda/']}}

        fs.mkdir(path.join(this.userPath, 'browsers'), (err) => console.log);

        this.writeManifest('firefox.json', firefoxJson);
        this.writeManifest('chrome.json', chromeJson);
    }

    private writeManifest(filename: string, manifest: object) {
        fs.writeFile(
            path.join(this.userPath, 'browsers', filename),
            JSON.stringify(manifest, null, 2),
            (err) => console.log
        );
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

    // Setup registry and/or directories
    // TODO: Do other browsers use different directories?
    enableManifest() {
        switch (process.platform) {
            case 'win32':
                this.createWindowsRegistry('HKLM\\SOFTWARE\\Mozilla\\Firefox', 'HKCU\\SOFTWARE\\Mozilla\\NativeMessagingHosts\\com.8bit.bitwarden', 'firefox.json')
                this.createWindowsRegistry('HKCU\\SOFTWARE\\Google\\Chrome', 'HKCU\\SOFTWARE\\Google\\Chrome\\NativeMessagingHosts\\com.8bit.bitwarden', 'chrome.json')
                break;
            case 'darwin':
                break;
            case 'linux':
            default:
                break;
        }
    }

    private createWindowsRegistry(check: string, location: string, jsonFile: string) {
        const regedit = require('regedit');
        regedit.setExternalVBSLocation('resources/regedit/vbs');

        const list = util.promisify(regedit.list);
        const createKey = util.promisify(regedit.createKey);
        const putValue = util.promisify(regedit.putValue);

        // Check installed
        list(check)
            .then(() => {
                // Create path
                return createKey(location);
            })
            .then(() => {
                // Insert path to manifest
                const obj: any = {};
                obj[location] = {
                    'default': {
                        value: path.join(this.userPath, 'browsers', jsonFile),
                        type: 'REG_DEFAULT',
                    },
                }

                return putValue(obj);
            })
            .catch()
    }
}
