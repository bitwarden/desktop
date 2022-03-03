import { existsSync, promises as fs } from "fs";
import { Socket } from "net";
import { homedir, userInfo } from "os";
import * as path from "path";
import * as util from "util";

import { ipcMain } from "electron";
import * as ipc from "node-ipc";

import { LogService } from "jslib-common/abstractions/log.service";
import { WindowMain } from "jslib-electron/window.main";

export class NativeMessagingMain {
  private connected: Socket[] = [];
  private socket: any;

  constructor(
    private logService: LogService,
    private windowMain: WindowMain,
    private userPath: string,
    private exePath: string
  ) {}

  async listen() {
    ipc.config.id = "bitwarden";
    ipc.config.retry = 1500;
    if (process.platform === "darwin") {
      if (!existsSync(`${homedir()}/tmp`)) {
        await fs.mkdir(`${homedir()}/tmp`);
      }
      ipc.config.socketRoot = `${homedir()}/tmp/`;
    }

    ipc.serve(() => {
      ipc.server.on("message", (data: any, socket: any) => {
        this.socket = socket;
        this.windowMain.win.webContents.send("nativeMessaging", data);
      });

      ipcMain.on("nativeMessagingReply", (event, msg) => {
        if (this.socket != null && msg != null) {
          this.send(msg, this.socket);
        }
      });

      ipc.server.on("connect", (socket: Socket) => {
        this.connected.push(socket);
      });

      ipc.server.on("socket.disconnected", (socket, destroyedSocketID) => {
        const index = this.connected.indexOf(socket);
        if (index > -1) {
          this.connected.splice(index, 1);
        }

        this.socket = null;
        ipc.log("client " + destroyedSocketID + " has disconnected!");
      });
    });

    ipc.server.start();
  }

  stop() {
    ipc.server.stop();
    // Kill all existing connections
    this.connected.forEach((socket) => {
      if (!socket.destroyed) {
        socket.destroy();
      }
    });
  }

  send(message: object, socket: any) {
    ipc.server.emit(socket, "message", message);
  }

  generateManifests() {
    const baseJson = {
      name: "com.8bit.bitwarden",
      description: "Bitwarden desktop <-> browser bridge",
      path: this.binaryPath(),
      type: "stdio",
    };

    const firefoxJson = {
      ...baseJson,
      ...{ allowed_extensions: ["{446900e4-71c2-419f-a6a7-df9c091e268b}"] },
    };
    const chromeJson = {
      ...baseJson,
      ...{
        allowed_origins: [
          "chrome-extension://nngceckbapebfimnlniiiahkandclblb/",
          "chrome-extension://jbkfoedolllekgbhcbcoahefnbanhhlh/",
          "chrome-extension://ccnckbpmaceehanjmeomladnmlffdjgn/",
        ],
      },
    };

    switch (process.platform) {
      case "win32": {
        const destination = path.join(this.userPath, "browsers");
        this.writeManifest(path.join(destination, "firefox.json"), firefoxJson);
        this.writeManifest(path.join(destination, "chrome.json"), chromeJson);

        this.createWindowsRegistry(
          "HKLM\\SOFTWARE\\Mozilla\\Firefox",
          "HKCU\\SOFTWARE\\Mozilla\\NativeMessagingHosts\\com.8bit.bitwarden",
          path.join(destination, "firefox.json")
        );
        this.createWindowsRegistry(
          "HKCU\\SOFTWARE\\Google\\Chrome",
          "HKCU\\SOFTWARE\\Google\\Chrome\\NativeMessagingHosts\\com.8bit.bitwarden",
          path.join(destination, "chrome.json")
        );
        break;
      }
      case "darwin": {
        const nmhs = this.getDarwinNMHS();
        for (const [key, value] of Object.entries(nmhs)) {
          if (existsSync(value)) {
            const p = path.join(value, "NativeMessagingHosts", "com.8bit.bitwarden.json");

            let manifest: any = chromeJson;
            if (key === "Firefox") {
              manifest = firefoxJson;
            }

            this.writeManifest(p, manifest).catch((e) =>
              this.logService.error(`Error writing manifest for ${key}. ${e}`)
            );
          } else {
            this.logService.warning(`${key} not found skipping.`);
          }
        }
        break;
      }
      case "linux":
        if (existsSync(`${this.homedir()}/.mozilla/`)) {
          this.writeManifest(
            `${this.homedir()}/.mozilla/native-messaging-hosts/com.8bit.bitwarden.json`,
            firefoxJson
          );
        }

        if (existsSync(`${this.homedir()}/.config/google-chrome/`)) {
          this.writeManifest(
            `${this.homedir()}/.config/google-chrome/NativeMessagingHosts/com.8bit.bitwarden.json`,
            chromeJson
          );
        }

        if (existsSync(`${this.homedir()}/.config/microsoft-edge/`)) {
          this.writeManifest(
            `${this.homedir()}/.config/microsoft-edge/NativeMessagingHosts/com.8bit.bitwarden.json`,
            chromeJson
          );
        }
        break;
      default:
        break;
    }
  }

  removeManifests() {
    switch (process.platform) {
      case "win32":
        fs.unlink(path.join(this.userPath, "browsers", "firefox.json"));
        fs.unlink(path.join(this.userPath, "browsers", "chrome.json"));
        this.deleteWindowsRegistry(
          "HKCU\\SOFTWARE\\Mozilla\\NativeMessagingHosts\\com.8bit.bitwarden"
        );
        this.deleteWindowsRegistry(
          "HKCU\\SOFTWARE\\Google\\Chrome\\NativeMessagingHosts\\com.8bit.bitwarden"
        );
        break;
      case "darwin": {
        const nmhs = this.getDarwinNMHS();
        for (const [, value] of Object.entries(nmhs)) {
          const p = path.join(value, "NativeMessagingHosts", "com.8bit.bitwarden.json");
          if (existsSync(p)) {
            fs.unlink(p);
          }
        }
        break;
      }
      case "linux":
        if (
          existsSync(`${this.homedir()}/.mozilla/native-messaging-hosts/com.8bit.bitwarden.json`)
        ) {
          fs.unlink(`${this.homedir()}/.mozilla/native-messaging-hosts/com.8bit.bitwarden.json`);
        }

        if (
          existsSync(
            `${this.homedir()}/.config/google-chrome/NativeMessagingHosts/com.8bit.bitwarden.json`
          )
        ) {
          fs.unlink(
            `${this.homedir()}/.config/google-chrome/NativeMessagingHosts/com.8bit.bitwarden.json`
          );
        }

        if (
          existsSync(
            `${this.homedir()}/.config/microsoft-edge/NativeMessagingHosts/com.8bit.bitwarden.json`
          )
        ) {
          fs.unlink(
            `${this.homedir()}/.config/microsoft-edge/NativeMessagingHosts/com.8bit.bitwarden.json`
          );
        }
        break;
      default:
        break;
    }
  }

  private getDarwinNMHS() {
    /* eslint-disable no-useless-escape */
    return {
      Firefox: `${this.homedir()}/Library/Application\ Support/Mozilla/`,
      Chrome: `${this.homedir()}/Library/Application\ Support/Google/Chrome/`,
      "Chrome Beta": `${this.homedir()}/Library/Application\ Support/Google/Chrome\ Beta/`,
      "Chrome Dev": `${this.homedir()}/Library/Application\ Support/Google/Chrome\ Dev/`,
      "Chrome Canary": `${this.homedir()}/Library/Application\ Support/Google/Chrome\ Canary/`,
      Chromium: `${this.homedir()}/Library/Application\ Support/Chromium/`,
      "Microsoft Edge": `${this.homedir()}/Library/Application\ Support/Microsoft\ Edge/`,
      "Microsoft Edge Beta": `${this.homedir()}/Library/Application\ Support/Microsoft\ Edge\ Beta/`,
      "Microsoft Edge Dev": `${this.homedir()}/Library/Application\ Support/Microsoft\ Edge\ Dev/`,
      "Microsoft Edge Canary": `${this.homedir()}/Library/Application\ Support/Microsoft\ Edge\ Canary/`,
      Vivaldi: `${this.homedir()}/Library/Application\ Support/Vivaldi/`,
    };
    /* eslint-enable no-useless-escape */
  }

  private async writeManifest(destination: string, manifest: object) {
    if (!existsSync(path.dirname(destination))) {
      await fs.mkdir(path.dirname(destination));
    }
    fs.writeFile(destination, JSON.stringify(manifest, null, 2)).catch(this.logService.error);
  }

  private binaryPath() {
    if (process.platform === "win32") {
      return path.join(path.dirname(this.exePath), "resources", "native-messaging.bat");
    }

    return this.exePath;
  }

  private getRegeditInstance() {
    // eslint-disable-next-line
    const regedit = require("regedit");
    regedit.setExternalVBSLocation(path.join(path.dirname(this.exePath), "resources/regedit/vbs"));

    return regedit;
  }

  private async createWindowsRegistry(check: string, location: string, jsonFile: string) {
    const regedit = this.getRegeditInstance();

    const list = util.promisify(regedit.list);
    const createKey = util.promisify(regedit.createKey);
    const putValue = util.promisify(regedit.putValue);

    this.logService.debug(`Adding registry: ${location}`);

    // Check installed
    try {
      await list(check);
    } catch {
      this.logService.warning(`Not finding registry ${check} skipping.`);
      return;
    }

    try {
      await createKey(location);

      // Insert path to manifest
      const obj: any = {};
      obj[location] = {
        default: {
          value: jsonFile,
          type: "REG_DEFAULT",
        },
      };

      return putValue(obj);
    } catch (error) {
      this.logService.error(error);
    }
  }

  private async deleteWindowsRegistry(key: string) {
    const regedit = this.getRegeditInstance();

    const list = util.promisify(regedit.list);
    const deleteKey = util.promisify(regedit.deleteKey);

    this.logService.debug(`Removing registry: ${key}`);

    try {
      await list(key);
      await deleteKey(key);
    } catch {
      this.logService.error(`Unable to delete registry key: ${key}`);
    }
  }

  private homedir() {
    if (process.platform === "darwin") {
      return userInfo().homedir;
    } else {
      return homedir();
    }
  }
}
