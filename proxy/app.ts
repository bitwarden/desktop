import NativeMessage from './nativemessage';
import IPC from './ipc';

const args = process.argv.slice(2);

class Proxy {
    ipc: IPC;
    nativeMessage: NativeMessage;

    constructor() {
        this.ipc = new IPC();
        this.nativeMessage = new NativeMessage(this.ipc);
    }

    run() {
        this.ipc.connect();
        this.nativeMessage.listen();
    }
}

const proxy = new Proxy();
proxy.run();
