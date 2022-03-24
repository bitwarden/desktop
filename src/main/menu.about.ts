import { BrowserWindow, clipboard, dialog, MenuItemConstructorOptions } from "electron";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { UpdaterMain } from "jslib-electron/updater.main";
import { isMacAppStore, isSnapStore, isWindowsStore } from "jslib-electron/utils";

import { IMenubarMenu } from "./menubar";

export class AboutMenu implements IMenubarMenu {
  readonly id: string = "about";

  get label(): string {
    return "";
  }

  get items(): MenuItemConstructorOptions[] {
    return [this.separator, this.checkForUpdates, this.aboutBitwarden];
  }

  private readonly _i18nService: I18nService;
  private readonly _updater: UpdaterMain;
  private readonly _window: BrowserWindow;
  private readonly _version: string;

  constructor(
    i18nService: I18nService,
    version: string,
    window: BrowserWindow,
    updater: UpdaterMain
  ) {
    this._i18nService = i18nService;
    this._updater = updater;
    this._version = version;
    this._window = window;
  }

  private get separator(): MenuItemConstructorOptions {
    return { type: "separator" };
  }

  private get checkForUpdates(): MenuItemConstructorOptions {
    return {
      id: "checkForUpdates",
      label: this.localize("checkForUpdates"),
      visible: !isWindowsStore() && !isSnapStore() && !isMacAppStore(),
      click: () => this.checkForUpdate(),
    };
  }

  private get aboutBitwarden(): MenuItemConstructorOptions {
    return {
      id: "aboutBitwarden",
      label: this.localize("aboutBitwarden"),
      click: async () => {
        const aboutInformation =
          this.localize("version", this._version) +
          "\nShell " +
          process.versions.electron +
          "\nRenderer " +
          process.versions.chrome +
          "\nNode " +
          process.versions.node +
          "\nArchitecture " +
          process.arch;
        const result = await dialog.showMessageBox(this._window, {
          title: "Bitwarden",
          message: "Bitwarden",
          detail: aboutInformation,
          type: "info",
          noLink: true,
          buttons: [this.localize("ok"), this.localize("copy")],
        });
        if (result.response === 1) {
          clipboard.writeText(aboutInformation);
        }
      },
    };
  }

  private localize(s: string, p?: string) {
    return this._i18nService.t(s, p);
  }

  private async checkForUpdate() {
    this._updater.checkForUpdate(true);
  }
}
