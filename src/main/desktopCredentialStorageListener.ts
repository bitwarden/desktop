import { passwords } from "@bitwarden/desktop-native";
import { ipcMain } from "electron";

import { BiometricMain } from "./biometric/biometric.main";

const AuthRequiredSuffix = "_biometric";
const AuthenticatedActions = ["getPassword"];

export class DesktopCredentialStorageListener {
  constructor(private serviceName: string, private biometricService: BiometricMain) {}

  init() {
    ipcMain.handle("keytar", async (event: any, message: any) => {
      try {
        let serviceName = this.serviceName;
        message.keySuffix = "_" + (message.keySuffix ?? "");
        if (message.keySuffix !== "_") {
          serviceName += message.keySuffix;
        }

        const authenticationRequired =
          AuthenticatedActions.includes(message.action) && AuthRequiredSuffix === message.keySuffix;
        const authenticated = !authenticationRequired || (await this.authenticateBiometric());

        let val: string | boolean = null;
        if (authenticated && message.action && message.key) {
          if (message.action === "getPassword") {
            val = await this.getPassword(serviceName, message.key);
          } else if (message.action === "hasPassword") {
            const result = await this.getPassword(serviceName, message.key);
            val = result != null;
          } else if (message.action === "setPassword" && message.value) {
            await passwords.setPassword(serviceName, message.key, message.value);
          } else if (message.action === "deletePassword") {
            await passwords.deletePassword(serviceName, message.key);
          }
        }
        return val;
      } catch {
        return null;
      }
    });
  }

  // Gracefully handle old keytar values, and if detected updated the entry to the proper format
  private async getPassword(serviceName: string, key: string) {
    let val = await passwords.getPassword(serviceName, key);
    try {
      JSON.parse(val);
    } catch (e) {
      val = await passwords.getPasswordKeytar(serviceName, key);
      await passwords.setPassword(serviceName, key, val);
    }
    return val;
  }

  private async authenticateBiometric(): Promise<boolean> {
    if (this.biometricService) {
      return await this.biometricService.authenticateBiometric();
    }
    return false;
  }
}
