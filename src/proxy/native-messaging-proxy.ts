import IPC from "./ipc";
import NativeMessage from "./nativemessage";

// Proxy is a lightweight application which provides bi-directional communication
// between the browser extension and a running desktop application.
//
// Browser extension <-[native messaging]-> proxy <-[ipc]-> desktop
export class NativeMessagingProxy {
  private ipc: IPC;
  private nativeMessage: NativeMessage;

  constructor() {
    this.ipc = new IPC();
    this.nativeMessage = new NativeMessage(this.ipc);
  }

  run() {
    this.ipc.connect();
    this.nativeMessage.listen();

    this.ipc.onMessage = this.nativeMessage.send;
  }
}
