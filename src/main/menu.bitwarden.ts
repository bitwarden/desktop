import { BrowserWindow, dialog, MenuItem, MenuItemConstructorOptions } from "electron";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";

import { UpdaterMain } from "jslib-electron/updater.main";
import { isMacAppStore, isSnapStore, isWindowsStore } from "jslib-electron/utils";

import { IMenubarMenu } from "./menubar";

import { MenuAccount } from "./menu.updater";

// AKA: "FirstMenu" or "MacMenu" - the first menu that shows on all macOs apps
export class BitwardenMenu implements IMenubarMenu {
  readonly id: string = "bitwarden";
  readonly label: string = "Bitwarden";

  get items(): MenuItemConstructorOptions[] {
    const items = [this.aboutBitwarden, this.checkForUpdates];
    if (this.aboutBitwarden.visible === true || this.checkForUpdates.visible === true) {
      items.push(this.separator);
    }
    items.push(this.settings);
    items.push(this.lock);
    items.push(this.lockAll);
    items.push(this.logOut);
    items.push(this.services);

    if (
      this.hideBitwarden.visible === true ||
      this.hideOthers.visible === true ||
      this.showAll.visible === true
    ) {
      items.push(this.separator);
    }

    items.push(this.hideBitwarden);
    items.push(this.hideOthers);
    items.push(this.showAll);

    if (this.quitBitwarden.visible === true) {
      items.push(this.separator);
    }
    items.push(this.quitBitwarden);
    return items;
  }

  private readonly _i18nService: I18nService;
  private readonly _updater: UpdaterMain;
  private readonly _messagingService: MessagingService;
  private readonly _accounts: { [userId: string]: MenuAccount };
  private readonly _window: BrowserWindow;
  private readonly _isLocked: boolean;

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

  private get hasAccounts(): boolean {
    return this._accounts != null && Object.keys(this._accounts).length > 0;
  }

  private get aboutBitwarden(): MenuItemConstructorOptions {
    return {
      id: "aboutBitwarden",
      label: this.localize("aboutBitwarden"),
      role: "about",
      visible: isMacAppStore(),
    };
  }

  private get checkForUpdates(): MenuItemConstructorOptions {
    return {
      id: "checkForUpdates",
      label: this.localize("checkForUpdates"),
      click: (menuItem) => this.checkForUpdate(menuItem),
      visible: !isMacAppStore() && !isWindowsStore() && !isSnapStore(),
    };
  }

  private get separator(): MenuItemConstructorOptions {
    return {
      type: "separator",
    };
  }

  private get settings(): MenuItemConstructorOptions {
    return {
      id: "settings",
      label: this.localize(process.platform === "darwin" ? "preferences" : "settings"),
      click: () => this.sendMessage("openSettings"),
      accelerator: "CmdOrCtrl+,",
      enabled: !this._isLocked,
    };
  }

  private get lock(): MenuItemConstructorOptions {
    return {
      id: "lock",
      label: this.localize("lockVault"),
      submenu: this.lockSubmenu,
      enabled: this.hasAccounts,
    };
  }

  private get lockSubmenu(): MenuItemConstructorOptions[] {
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

  private get lockAll(): MenuItemConstructorOptions {
    return {
      id: "lockAllNow",
      label: this.localize("lockAllVaults"),
      click: () => this.sendMessage("lockAllVaults"),
      accelerator: "CmdOrCtrl+L",
      enabled: this.hasAccounts,
    };
  }

  private get logOut(): MenuItemConstructorOptions {
    return {
      id: "logOut",
      label: this.localize("logOut"),
      submenu: this.logOutSubmenu,
      enabled: this.hasAccounts,
    };
  }

  private get logOutSubmenu(): MenuItemConstructorOptions[] {
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

  private get services(): MenuItemConstructorOptions {
    return {
      id: "services",
      label: this.localize("services"),
      role: "services",
      submenu: [],
      visible: isMacAppStore(),
    };
  }

  private get hideBitwarden(): MenuItemConstructorOptions {
    return {
      id: "hideBitwarden",
      label: this.localize("hideBitwarden"),
      role: "hide",
      visible: isMacAppStore(),
    };
  }

  private get hideOthers(): MenuItemConstructorOptions {
    return {
      id: "hideOthers",
      label: this.localize("hideOthers"),
      role: "hideOthers",
      visible: isMacAppStore(),
    };
  }

  private get showAll(): MenuItemConstructorOptions {
    return {
      id: "showAll",
      label: this.localize("showAll"),
      role: "unhide",
      visible: isMacAppStore(),
    };
  }

  private get quitBitwarden(): MenuItemConstructorOptions {
    return {
      id: "quitBitwarden",
      label: this.localize("quitBitwarden"),
      role: "quit",
      visible: isMacAppStore(),
    };
  }

  private localize(s: string) {
    return this._i18nService.t(s);
  }

  private async checkForUpdate(menuItem: MenuItem) {
    menuItem.enabled = false;
    this._updater.checkForUpdate(true);
    menuItem.enabled = true;
  }

  private sendMessage(message: string, args?: any) {
    this._messagingService.send(message, args);
  }
}
