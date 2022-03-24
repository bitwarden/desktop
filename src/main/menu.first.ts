import { BrowserWindow, dialog, MenuItem, MenuItemConstructorOptions } from "electron";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { UpdaterMain } from "jslib-electron/updater.main";
import { isMacAppStore, isSnapStore, isWindowsStore } from "jslib-electron/utils";

import { MenuAccount } from "./menu.updater";

export class FirstMenu {
  protected readonly _i18nService: I18nService;
  protected readonly _updater: UpdaterMain;
  protected readonly _messagingService: MessagingService;
  protected readonly _accounts: { [userId: string]: MenuAccount };
  protected readonly _window: BrowserWindow;
  protected readonly _isLocked: boolean;

  constructor(
    i18nService: I18nService,
    messagingService: MessagingService,
    updater: UpdaterMain,
    window: BrowserWindow,
    accounts: { [userId: string]: MenuAccount },
    isLocked: boolean
  ) {
    this._i18nService = i18nService;
    this._updater = updater;
    this._messagingService = messagingService;
    this._window = window;
    this._accounts = accounts;
    this._isLocked = isLocked;
  }

  protected get hasAccounts(): boolean {
    return this._accounts != null && Object.keys(this._accounts).length > 0;
  }

  protected get checkForUpdates(): MenuItemConstructorOptions {
    return {
      id: "checkForUpdates",
      label: this.localize("checkForUpdates"),
      click: (menuItem) => this.checkForUpdate(menuItem),
      visible: !isMacAppStore() && !isWindowsStore() && !isSnapStore(),
    };
  }

  protected get separator(): MenuItemConstructorOptions {
    return {
      type: "separator",
    };
  }

  protected get settings(): MenuItemConstructorOptions {
    return {
      id: "settings",
      label: this.localize(process.platform === "darwin" ? "preferences" : "settings"),
      click: () => this.sendMessage("openSettings"),
      accelerator: "CmdOrCtrl+,",
      enabled: !this._isLocked,
    };
  }

  protected get lock(): MenuItemConstructorOptions {
    return {
      id: "lock",
      label: this.localize("lockVault"),
      submenu: this.lockSubmenu,
      enabled: this.hasAccounts,
    };
  }

  protected get lockSubmenu(): MenuItemConstructorOptions[] {
    const value: MenuItemConstructorOptions[] = [];
    for (const userId in this._accounts) {
      if (userId == null) {
        continue;
      }

      value.push({
        label: this._accounts[userId].email,
        id: `lockNow_${this._accounts[userId].userId}`,
        click: () => this.sendMessage("lockVault", { userId: this._accounts[userId].userId }),
        enabled: !this._accounts[userId].isLocked,
        visible: this._accounts[userId].isAuthenticated,
      });
    }
    return value;
  }

  protected get lockAll(): MenuItemConstructorOptions {
    return {
      id: "lockAllNow",
      label: this.localize("lockAllVaults"),
      click: () => this.sendMessage("lockAllVaults"),
      accelerator: "CmdOrCtrl+L",
      enabled: this.hasAccounts,
    };
  }

  protected get logOut(): MenuItemConstructorOptions {
    return {
      id: "logOut",
      label: this.localize("logOut"),
      submenu: this.logOutSubmenu,
      enabled: this.hasAccounts,
    };
  }

  protected get logOutSubmenu(): MenuItemConstructorOptions[] {
    const value: MenuItemConstructorOptions[] = [];
    for (const userId in this._accounts) {
      if (userId == null) {
        continue;
      }

      value.push({
        label: this._accounts[userId].email,
        id: `logOut_${this._accounts[userId].userId}`,
        click: async () => {
          const result = await dialog.showMessageBox(this._window, {
            title: this.localize("logOut"),
            message: this.localize("logOut"),
            detail: this.localize("logOutConfirmation"),
            buttons: [this.localize("logOut"), this.localize("cancel")],
            cancelId: 1,
            defaultId: 0,
            noLink: true,
          });
          if (result.response === 0) {
            this.sendMessage("logout", { userId: this._accounts[userId].userId });
          }
        },
        visible: this._accounts[userId].isAuthenticated,
      });
    }
    return value;
  }

  protected localize(s: string) {
    return this._i18nService.t(s);
  }

  protected async checkForUpdate(menuItem: MenuItem) {
    menuItem.enabled = false;
    this._updater.checkForUpdate(true);
    menuItem.enabled = true;
  }

  protected sendMessage(message: string, args?: any) {
    this._messagingService.send(message, args);
  }
}
