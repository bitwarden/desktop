import { BrowserWindow, dialog, MenuItemConstructorOptions, shell } from "electron";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { isMacAppStore, isWindowsStore } from "jslib-electron/utils";

import { IMenubarMenu } from "./menubar";

export class AccountMenu implements IMenubarMenu {
  readonly id: string = "accountMenu";

  get label(): string {
    return this.localize("account");
  }

  get items(): MenuItemConstructorOptions[] {
    return [
      this.premiumMembership,
      this.changeMasterPassword,
      this.twoStepLogin,
      this.fingerprintPhrase,
    ];
  }

  private readonly _i18nService: I18nService;
  private readonly _messagingService: MessagingService;
  private readonly _webVaultUrl: string;
  private readonly _window: BrowserWindow;
  private readonly _isLocked: boolean;

  constructor(
    i18nService: I18nService,
    messagingService: MessagingService,
    webVaultUrl: string,
    window: BrowserWindow,
    isLocked: boolean
  ) {
    this._i18nService = i18nService;
    this._messagingService = messagingService;
    this._webVaultUrl = webVaultUrl;
    this._window = window;
    this._isLocked = isLocked;
  }

  private get premiumMembership(): MenuItemConstructorOptions {
    return {
      label: this.localize("premiumMembership"),
      click: () => this.sendMessage("openPremium"),
      id: "premiumMembership",
      visible: !isWindowsStore() && !isMacAppStore(),
      enabled: !this._isLocked,
    };
  }

  private get changeMasterPassword(): MenuItemConstructorOptions {
    return {
      label: this.localize("changeMasterPass"),
      id: "changeMasterPass",
      click: async () => {
        const result = await dialog.showMessageBox(this._window, {
          title: this.localize("changeMasterPass"),
          message: this.localize("changeMasterPass"),
          detail: this.localize("changeMasterPasswordConfirmation"),
          buttons: [this.localize("yes"), this.localize("no")],
          cancelId: 1,
          defaultId: 0,
          noLink: true,
        });
        if (result.response === 0) {
          shell.openExternal(this._webVaultUrl);
        }
      },
      enabled: !this._isLocked,
    };
  }

  private get twoStepLogin(): MenuItemConstructorOptions {
    return {
      label: this.localize("twoStepLogin"),
      id: "twoStepLogin",
      click: async () => {
        const result = await dialog.showMessageBox(this._window, {
          title: this.localize("twoStepLogin"),
          message: this.localize("twoStepLogin"),
          detail: this.localize("twoStepLoginConfirmation"),
          buttons: [this.localize("yes"), this.localize("no")],
          cancelId: 1,
          defaultId: 0,
          noLink: true,
        });
        if (result.response === 0) {
          shell.openExternal(this._webVaultUrl);
        }
      },
      enabled: !this._isLocked,
    };
  }

  private get fingerprintPhrase(): MenuItemConstructorOptions {
    return {
      label: this.localize("fingerprintPhrase"),
      id: "fingerprintPhrase",
      click: () => this.sendMessage("showFingerprintPhrase"),
      enabled: !this._isLocked,
    };
  }

  private localize(s: string) {
    return this._i18nService.t(s);
  }

  private sendMessage(message: string, args?: any) {
    this._messagingService.send(message, args);
  }
}
