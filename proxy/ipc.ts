/* tslint:disable:no-console */
import * as ipc from 'node-ipc';
import { spawn } from 'child_process';

const StartDesktopCooldown = 60 * 1000; // 1 minute delay between attempts to start desktop

ipc.config.id = 'proxy';
ipc.config.retry = 1500;
ipc.config.logger = console.warn; // Stdout is used for native messaging

export default class IPC {
    private connected = false;
    private lastStartedDesktop = 0;

    connect() {
        ipc.connectTo('bitwarden', () => {
            ipc.of.bitwarden.on('connect', () => {
                this.connected = true;
                console.error(
                    '## connected to bitwarden desktop ##',
                    ipc.config.delay
                );
                ipc.of.bitwarden.emit('message', 'hello');
            });

            ipc.of.bitwarden.on('disconnect', () => {
                this.connected = false;
                console.error('disconnected from world');
            });

            ipc.of.bitwarden.on('message', (data: any) => {
                console.error('got a message from world : ', data);
            });

            ipc.of.bitwarden.on('error', (err: any) => {
                if (err.syscall === 'connect' && this.lastStartedDesktop + StartDesktopCooldown < Date.now()) {
                    this.lastStartedDesktop = Date.now();
                    console.error('Attempting to start Bitwarden desktop application');
                    this.startDesktop();
                }
                console.error('error', err);
            });
        });
    }

    isConnected() {
        return this.connected;
    }

    send(json: object) {
        ipc.of.bitwarden.emit('message', json);
    }

    // TODO: Do we want to start the desktop application? How do we get the install path?
    private startDesktop() {
        spawn(
            'C:\\Users\\Oscar\\Documents\\Projects\\Bitwarden\\desktop\\dist\\Bitwarden-Portable-1.22.2.exe',
            { detached: true }
        );
    }
}
