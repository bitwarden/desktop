import { app, Menu } from "electron";

import { BaseMenu } from "jslib-electron/baseMenu";

import { Main } from "../../main";

import { MenuUpdateRequest } from "./menu.updater";
import { Menubar } from "./menubar";

const cloudWebVaultUrl = "https://vault.bitwarden.com";

export class MenuMain extends BaseMenu {
  constructor(private main: Main) {
    super(main.i18nService, main.windowMain);
  }

  async init() {
    this.initContextMenu();
    await this.setMenu();
  }

  async updateApplicationMenuState(updateRequest: MenuUpdateRequest) {
    await this.setMenu(updateRequest);
  }

  private async setMenu(updateRequest?: MenuUpdateRequest) {
    Menu.setApplicationMenu(
      new Menubar(
        this.main.i18nService,
        this.main.messagingService,
        this.main.updaterMain,
        this.windowMain,
        await this.getWebVaultUrl(),
        app.getVersion(),
        updateRequest
      ).menu
    );
  }

  private async getWebVaultUrl() {
    let webVaultUrl = cloudWebVaultUrl;
    const urlsObj: any = await this.main.stateService.getEnvironmentUrls();
    if (urlsObj != null) {
      if (urlsObj.base != null) {
        webVaultUrl = urlsObj.base;
      } else if (urlsObj.webVault != null) {
        webVaultUrl = urlsObj.webVault;
      }
    }
    return webVaultUrl;
  }
}
