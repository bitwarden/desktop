import { ipcMain } from "electron";
import forceFocus from "forcefocus";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { WindowMain } from "jslib-electron/window.main";

import { BiometricMain } from "src/main/biometric/biometric.main";

export default class BiometricWindowsMain implements BiometricMain {
  isError = false;

  private windowsSecurityCredentialsUiModule: any;

  constructor(
    private i18nservice: I18nService,
    private windowMain: WindowMain,
    private stateService: StateService,
    private logService: LogService
  ) {}

  async init() {
    this.windowsSecurityCredentialsUiModule = this.getWindowsSecurityCredentialsUiModule();
    let supportsBiometric = false;
    try {
      supportsBiometric = await this.supportsBiometric();
    } catch {
      // store error state so we can let the user know on the settings page
      this.isError = true;
    }
    await this.stateService.setEnableBiometric(supportsBiometric);
    await this.stateService.setBiometricText("unlockWithWindowsHello");
    await this.stateService.setNoAutoPromptBiometricsText("noAutoPromptWindowsHello");

    ipcMain.on("biometric", async (event: any, message: any) => {
      event.returnValue = await this.authenticateBiometric();
    });
  }

  async supportsBiometric(): Promise<boolean> {
    const availability = await this.checkAvailabilityAsync();

    return this.getAllowedAvailabilities().includes(availability);
  }

  async authenticateBiometric(): Promise<boolean> {
    const module = this.getWindowsSecurityCredentialsUiModule();
    if (module == null) {
      return false;
    }

    const verification = await this.requestVerificationAsync(
      this.i18nservice.t("windowsHelloConsentMessage")
    );

    return verification === module.UserConsentVerificationResult.verified;
  }

  getWindowsSecurityCredentialsUiModule(): any {
    try {
      if (this.windowsSecurityCredentialsUiModule == null && this.getWindowsMajorVersion() >= 10) {
        this.windowsSecurityCredentialsUiModule = require("@nodert-win10-rs4/windows.security.credentials.ui");
      }
      return this.windowsSecurityCredentialsUiModule;
    } catch {
      this.isError = true;
    }
    return null;
  }

  async checkAvailabilityAsync(): Promise<any> {
    const module = this.getWindowsSecurityCredentialsUiModule();
    if (module != null) {
      // eslint-disable-next-line
      return new Promise((resolve, reject) => {
        try {
          module.UserConsentVerifier.checkAvailabilityAsync((error: Error, result: any) => {
            if (error) {
              return resolve(null);
            }
            return resolve(result);
          });
        } catch {
          this.isError = true;
          return resolve(null);
        }
      });
    }
    return Promise.resolve(null);
  }

  async requestVerificationAsync(message: string): Promise<any> {
    const module = this.getWindowsSecurityCredentialsUiModule();
    if (module != null) {
      return new Promise((resolve, reject) => {
        try {
          module.UserConsentVerifier.requestVerificationAsync(
            message,
            (error: Error, result: any) => {
              if (error) {
                return resolve(null);
              }
              return resolve(result);
            }
          );

          forceFocus.focusWindow(this.windowMain.win);
        } catch (error) {
          this.isError = true;
          return reject(error);
        }
      });
    }
    return Promise.resolve(null);
  }

  getAllowedAvailabilities(): any[] {
    try {
      const module = this.getWindowsSecurityCredentialsUiModule();
      if (module != null) {
        return [
          module.UserConsentVerifierAvailability.available,
          module.UserConsentVerifierAvailability.deviceBusy,
        ];
      }
    } catch {
      /*Ignore error*/
    }
    return [];
  }

  getWindowsMajorVersion(): number {
    if (process.platform !== "win32") {
      return -1;
    }
    try {
      // eslint-disable-next-line
      const version = require("os").release();
      return Number.parseInt(version.split(".")[0], 10);
    } catch {
      this.logService.error("Unable to resolve windows major version number");
    }
    return -1;
  }
}
