import * as ipc from 'node-ipc';

export class NativeMessagingService {
    private connected = false;

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
}
