/* eslint-disable no-console */
import { homedir } from "os";

import * as ipc from "node-ipc";

ipc.config.id = "proxy";
ipc.config.retry = 1500;
ipc.config.logger = console.warn; // Stdout is used for native messaging
if (process.platform === "darwin") {
  ipc.config.socketRoot = `${homedir()}/tmp/`;
}

export default class IPC {
  onMessage: (message: object) => void;

  private connected = false;

  connect() {
    ipc.connectTo("bitwarden", () => {
      ipc.of.bitwarden.on("connect", () => {
        this.connected = true;
        console.error("## connected to bitwarden desktop ##");

        // Notify browser extension, connection is established to desktop application.
        this.onMessage({ command: "connected" });
      });

      ipc.of.bitwarden.on("disconnect", () => {
        this.connected = false;
        console.error("disconnected from world");

        // Notify browser extension, no connection to desktop application.
        this.onMessage({ command: "disconnected" });
      });

      ipc.of.bitwarden.on("message", (message: any) => {
        this.onMessage(message);
      });

      ipc.of.bitwarden.on("error", (err: any) => {
        console.error("error", err);
      });
    });
  }

  isConnected(): boolean {
    return this.connected;
  }

  send(json: object) {
    ipc.of.bitwarden.emit("message", json);
  }
}
