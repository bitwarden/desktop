import { biometrics } from "@bitwarden/desktop-native";
import { ipcMain } from "electron";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { WindowMain } from "jslib-electron/window.main";


import { BiometricMain } from "src/main/biometric/biometric.main";

export default class BiometricWindowsMain implements BiometricMain {
  constructor(
    private i18nservice: I18nService,
    private windowMain: WindowMain,
    private stateService: StateService,
    private logService: LogService
  ) {}

  async init() {
    let supportsBiometric = false;
    try {
      supportsBiometric = await this.supportsBiometric();
    } catch (e) {
      this.logService.error(e);
    }
    await this.stateService.setEnableBiometric(supportsBiometric);
    await this.stateService.setBiometricText("unlockWithWindowsHello");
    await this.stateService.setNoAutoPromptBiometricsText("noAutoPromptWindowsHello");

    ipcMain.handle("biometric", async (event: any, message: any) => {
      return await this.authenticateBiometric();
    });
  }

  async supportsBiometric(): Promise<boolean> {
    return Promise.resolve(true);
  }

  async authenticateBiometric(): Promise<boolean> {
    const hwnd = this.windowMain.win.getNativeWindowHandle();
    return await biometrics.prompt(hwnd, this.i18nservice.t("windowsHelloConsentMessage"));
  }

  // TODO: Get someone with a w7 to verify this doesn't crash
  async checkAvailabilityAsync(): Promise<any> {
    return await biometrics.available();
  }
}
