import * as path from "path";

import { app } from "electron";

import { StateFactory } from "jslib-common/factories/stateFactory";
import { GlobalState } from "jslib-common/models/domain/globalState";
import { StateService } from "jslib-common/services/state.service";
import { ElectronLogService } from "jslib-electron/services/electronLog.service";
import { ElectronMainMessagingService } from "jslib-electron/services/electronMainMessaging.service";
import { ElectronStorageService } from "jslib-electron/services/electronStorage.service";
import { TrayMain } from "jslib-electron/tray.main";
import { UpdaterMain } from "jslib-electron/updater.main";
import { WindowMain } from "jslib-electron/window.main";

import { BiometricMain } from "./main/biometric/biometric.main";
import { DesktopCredentialStorageListener } from "./main/desktopCredentialStorageListener";
import { MenuMain } from "./main/menu/menu.main";
import { MessagingMain } from "./main/messaging.main";
import { NativeMessagingMain } from "./main/nativeMessaging.main";
import { PowerMonitorMain } from "./main/powerMonitor.main";
import { Account } from "./models/account";
import { I18nService } from "./services/i18n.service";

export class Main {
  logService: ElectronLogService;
  i18nService: I18nService;
  storageService: ElectronStorageService;
  messagingService: ElectronMainMessagingService;
  stateService: StateService;
  desktopCredentialStorageListener: DesktopCredentialStorageListener;

  windowMain: WindowMain;
  messagingMain: MessagingMain;
  updaterMain: UpdaterMain;
  menuMain: MenuMain;
  powerMonitorMain: PowerMonitorMain;
  trayMain: TrayMain;
  biometricMain: BiometricMain;
  nativeMessagingMain: NativeMessagingMain;

  constructor() {
    // Set paths for portable builds
    let appDataPath = null;
    if (process.env.BITWARDEN_APPDATA_DIR != null) {
      appDataPath = process.env.BITWARDEN_APPDATA_DIR;
    } else if (process.platform === "win32" && process.env.PORTABLE_EXECUTABLE_DIR != null) {
      appDataPath = path.join(process.env.PORTABLE_EXECUTABLE_DIR, "bitwarden-appdata");
    } else if (process.platform === "linux" && process.env.SNAP_USER_DATA != null) {
      appDataPath = path.join(process.env.SNAP_USER_DATA, "appdata");
    }

    app.on("ready", () => {
      // on ready stuff...
    });

    if (appDataPath != null) {
      app.setPath("userData", appDataPath);
    }
    app.setPath("logs", path.join(app.getPath("userData"), "logs"));

    const args = process.argv.slice(1);
    const watch = args.some((val) => val === "--watch");

    if (watch) {
      // eslint-disable-next-line
      require("electron-reload")(__dirname, {});
    }

    this.logService = new ElectronLogService(null, app.getPath("userData"));
    this.i18nService = new I18nService("en", "./locales/");

    const storageDefaults: any = {};
    // Default vault timeout to "on restart", and action to "lock"
    storageDefaults["global.vaultTimeout"] = -1;
    storageDefaults["global.vaultTimeoutAction"] = "lock";
    this.storageService = new ElectronStorageService(app.getPath("userData"), storageDefaults);

    // TODO: this state service will have access to on disk storage, but not in memory storage.
    // If we could get this to work using the stateService singleton that the rest of the app uses we could save
    // ourselves from some hacks, like having to manually update the app menu vs. the menu subscribing to events.
    this.stateService = new StateService(
      this.storageService,
      null,
      this.logService,
      null,
      new StateFactory(GlobalState, Account),
      false // Do not use disk caching because this will get out of sync with the renderer service
    );

    this.windowMain = new WindowMain(
      this.stateService,
      this.logService,
      true,
      undefined,
      undefined,
      (arg) => this.processDeepLink(arg),
      (win) => this.trayMain.setupWindowListeners(win)
    );
    this.messagingMain = new MessagingMain(this, this.stateService);
    this.updaterMain = new UpdaterMain(
      this.i18nService,
      this.windowMain,
      "desktop",
      null,
      null,
      null,
      "bitwarden"
    );
    this.menuMain = new MenuMain(this);
    this.powerMonitorMain = new PowerMonitorMain(this);
    this.trayMain = new TrayMain(this.windowMain, this.i18nService, this.stateService);

    this.messagingService = new ElectronMainMessagingService(this.windowMain, (message) => {
      this.messagingMain.onMessage(message);
    });

    if (process.platform === "win32") {
      // eslint-disable-next-line
      const BiometricWindowsMain = require("./main/biometric/biometric.windows.main").default;
      this.biometricMain = new BiometricWindowsMain(
        this.i18nService,
        this.windowMain,
        this.stateService,
        this.logService
      );
    } else if (process.platform === "darwin") {
      // eslint-disable-next-line
      const BiometricDarwinMain = require("./main/biometric/biometric.darwin.main").default;
      this.biometricMain = new BiometricDarwinMain(this.i18nService, this.stateService);
    }

    this.desktopCredentialStorageListener = new DesktopCredentialStorageListener(
      "Bitwarden",
      this.biometricMain
    );

    this.nativeMessagingMain = new NativeMessagingMain(
      this.logService,
      this.windowMain,
      app.getPath("userData"),
      app.getPath("exe")
    );
  }

  bootstrap() {
    this.desktopCredentialStorageListener.init();
    this.windowMain.init().then(
      async () => {
        const locale = await this.stateService.getLocale();
        await this.i18nService.init(locale != null ? locale : app.getLocale());
        this.messagingMain.init();
        this.menuMain.init();
        await this.trayMain.init("Bitwarden", [
          {
            label: this.i18nService.t("lockVault"),
            enabled: false,
            id: "lockVault",
            click: () => this.messagingService.send("lockVault"),
          },
        ]);
        if (await this.stateService.getEnableStartToTray()) {
          this.trayMain.hideToTray();
        }
        this.powerMonitorMain.init();
        await this.updaterMain.init();
        if (this.biometricMain != null) {
          await this.biometricMain.init();
        }

        if (await this.stateService.getEnableBrowserIntegration()) {
          this.nativeMessagingMain.listen();
        }

        app.removeAsDefaultProtocolClient("bitwarden");
        if (process.env.NODE_ENV === "development" && process.platform === "win32") {
          // Fix development build on Windows requirering a different protocol client
          app.setAsDefaultProtocolClient("bitwarden", process.execPath, [
            process.argv[1],
            path.resolve(process.argv[2]),
          ]);
        } else {
          app.setAsDefaultProtocolClient("bitwarden");
        }

        // Process protocol for macOS
        app.on("open-url", (event, url) => {
          event.preventDefault();
          this.processDeepLink([url]);
        });

        // Handle window visibility events
        this.windowMain.win.on("hide", () => {
          this.messagingService.send("windowHidden");
        });
        this.windowMain.win.on("minimize", () => {
          this.messagingService.send("windowHidden");
        });
      },
      (e: any) => {
        // eslint-disable-next-line
        console.error(e);
      }
    );
  }

  private processDeepLink(argv: string[]): void {
    argv
      .filter((s) => s.indexOf("bitwarden://") === 0)
      .forEach((s) => {
        const url = new URL(s);
        const code = url.searchParams.get("code");
        const receivedState = url.searchParams.get("state");
        if (code != null && receivedState != null) {
          this.messagingService.send("ssoCallback", { code: code, state: receivedState });
        }
      });
  }
}
