import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { debounceTime } from "rxjs/operators";

import { ModalService } from "jslib-angular/services/modal.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { VaultTimeoutService } from "jslib-common/abstractions/vaultTimeout.service";
import { DeviceType } from "jslib-common/enums/deviceType";
import { StorageLocation } from "jslib-common/enums/storageLocation";
import { ThemeType } from "jslib-common/enums/themeType";
import { Utils } from "jslib-common/misc/utils";
import { isWindowsStore } from "jslib-electron/utils";

import { SetPinComponent } from "../components/set-pin.component";

@Component({
  selector: "app-settings",
  templateUrl: "settings.component.html",
})
export class SettingsComponent implements OnInit {
  vaultTimeoutAction: string;
  pin: boolean = null;
  disableFavicons = false;
  enableBrowserIntegration = false;
  enableBrowserIntegrationFingerprint = false;
  enableMinToTray = false;
  enableCloseToTray = false;
  enableTray = false;
  showMinToTray = false;
  startToTray = false;
  minimizeOnCopyToClipboard = false;
  locale: string;
  vaultTimeouts: any[];
  localeOptions: any[];
  theme: ThemeType;
  themeOptions: any[];
  clearClipboard: number;
  clearClipboardOptions: any[];
  supportsBiometric: boolean;
  biometric: boolean;
  biometricText: string;
  noAutoPromptBiometrics: boolean;
  noAutoPromptBiometricsText: string;
  alwaysShowDock: boolean;
  showAlwaysShowDock = false;
  openAtLogin: boolean;
  requireEnableTray = false;

  enableTrayText: string;
  enableTrayDescText: string;
  enableMinToTrayText: string;
  enableMinToTrayDescText: string;
  enableCloseToTrayText: string;
  enableCloseToTrayDescText: string;
  startToTrayText: string;
  startToTrayDescText: string;

  vaultTimeout: FormControl = new FormControl(null);

  showSecurity = true;
  showAccountPreferences = true;
  showAppPreferences = true;

  currentUserEmail: string;

  constructor(
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private vaultTimeoutService: VaultTimeoutService,
    private stateService: StateService,
    private messagingService: MessagingService,
    private cryptoService: CryptoService,
    private modalService: ModalService
  ) {
    const isMac = this.platformUtilsService.getDevice() === DeviceType.MacOsDesktop;

    // Workaround to avoid ghosting trays https://github.com/electron/electron/issues/17622
    this.requireEnableTray = this.platformUtilsService.getDevice() === DeviceType.LinuxDesktop;

    const trayKey = isMac ? "enableMenuBar" : "enableTray";
    this.enableTrayText = this.i18nService.t(trayKey);
    this.enableTrayDescText = this.i18nService.t(trayKey + "Desc");

    const minToTrayKey = isMac ? "enableMinToMenuBar" : "enableMinToTray";
    this.enableMinToTrayText = this.i18nService.t(minToTrayKey);
    this.enableMinToTrayDescText = this.i18nService.t(minToTrayKey + "Desc");

    const closeToTrayKey = isMac ? "enableCloseToMenuBar" : "enableCloseToTray";
    this.enableCloseToTrayText = this.i18nService.t(closeToTrayKey);
    this.enableCloseToTrayDescText = this.i18nService.t(closeToTrayKey + "Desc");

    const startToTrayKey = isMac ? "startToMenuBar" : "startToTray";
    this.startToTrayText = this.i18nService.t(startToTrayKey);
    this.startToTrayDescText = this.i18nService.t(startToTrayKey + "Desc");

    this.vaultTimeouts = [
      // { name: i18nService.t('immediately'), value: 0 },
      { name: i18nService.t("oneMinute"), value: 1 },
      { name: i18nService.t("fiveMinutes"), value: 5 },
      { name: i18nService.t("fifteenMinutes"), value: 15 },
      { name: i18nService.t("thirtyMinutes"), value: 30 },
      { name: i18nService.t("oneHour"), value: 60 },
      { name: i18nService.t("fourHours"), value: 240 },
      { name: i18nService.t("onIdle"), value: -4 },
      { name: i18nService.t("onSleep"), value: -3 },
    ];

    if (this.platformUtilsService.getDevice() !== DeviceType.LinuxDesktop) {
      this.vaultTimeouts.push({ name: i18nService.t("onLocked"), value: -2 });
    }

    this.vaultTimeouts = this.vaultTimeouts.concat([
      { name: i18nService.t("onRestart"), value: -1 },
      { name: i18nService.t("never"), value: null },
    ]);

    const localeOptions: any[] = [];
    i18nService.supportedTranslationLocales.forEach((locale) => {
      let name = locale;
      if (i18nService.localeNames.has(locale)) {
        name += " - " + i18nService.localeNames.get(locale);
      }
      localeOptions.push({ name: name, value: locale });
    });
    localeOptions.sort(Utils.getSortFunction(i18nService, "name"));
    localeOptions.splice(0, 0, { name: i18nService.t("default"), value: null });
    this.localeOptions = localeOptions;

    this.themeOptions = [
      { name: i18nService.t("default"), value: ThemeType.System },
      { name: i18nService.t("light"), value: ThemeType.Light },
      { name: i18nService.t("dark"), value: ThemeType.Dark },
      { name: "Nord", value: ThemeType.Nord },
    ];

    this.clearClipboardOptions = [
      { name: i18nService.t("never"), value: null },
      { name: i18nService.t("tenSeconds"), value: 10 },
      { name: i18nService.t("twentySeconds"), value: 20 },
      { name: i18nService.t("thirtySeconds"), value: 30 },
      { name: i18nService.t("oneMinute"), value: 60 },
      { name: i18nService.t("twoMinutes"), value: 120 },
      { name: i18nService.t("fiveMinutes"), value: 300 },
    ];
  }

  async ngOnInit() {
    // App preferences
    this.showMinToTray = this.platformUtilsService.getDevice() !== DeviceType.LinuxDesktop;
    this.enableMinToTray = await this.stateService.getEnableMinimizeToTray();
    this.enableCloseToTray = await this.stateService.getEnableCloseToTray();
    this.enableTray = await this.stateService.getEnableTray();
    this.startToTray = await this.stateService.getEnableStartToTray();

    this.alwaysShowDock = await this.stateService.getAlwaysShowDock();
    this.showAlwaysShowDock = this.platformUtilsService.getDevice() === DeviceType.MacOsDesktop;
    this.openAtLogin = await this.stateService.getOpenAtLogin();

    this.locale = await this.stateService.getLocale();
    this.theme = await this.stateService.getTheme();

    if ((await this.stateService.getUserId()) == null) {
      return;
    }
    this.currentUserEmail = await this.stateService.getEmail();

    // Security
    this.vaultTimeout.setValue(await this.stateService.getVaultTimeout());
    this.vaultTimeoutAction = await this.stateService.getVaultTimeoutAction();
    this.vaultTimeout.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.saveVaultTimeoutOptions();
    });

    const pinSet = await this.vaultTimeoutService.isPinLockSet();
    this.pin = pinSet[0] || pinSet[1];

    // Account preferences
    this.disableFavicons = await this.stateService.getDisableFavicon();
    this.enableBrowserIntegration = await this.stateService.getEnableBrowserIntegration();
    this.enableBrowserIntegrationFingerprint =
      await this.stateService.getEnableBrowserIntegrationFingerprint();
    this.clearClipboard = await this.stateService.getClearClipboard();
    this.minimizeOnCopyToClipboard = await this.stateService.getMinimizeOnCopyToClipboard();
    this.supportsBiometric = await this.platformUtilsService.supportsBiometric();
    this.biometric = await this.vaultTimeoutService.isBiometricLockSet();
    this.biometricText = await this.stateService.getBiometricText();
    this.noAutoPromptBiometrics = await this.stateService.getNoAutoPromptBiometrics();
    this.noAutoPromptBiometricsText = await this.stateService.getNoAutoPromptBiometricsText();
  }

  async saveVaultTimeoutOptions() {
    if (this.vaultTimeoutAction === "logOut") {
      const confirmed = await this.platformUtilsService.showDialog(
        this.i18nService.t("vaultTimeoutLogOutConfirmation"),
        this.i18nService.t("vaultTimeoutLogOutConfirmationTitle"),
        this.i18nService.t("yes"),
        this.i18nService.t("cancel"),
        "warning"
      );
      if (!confirmed) {
        this.vaultTimeoutAction = "lock";
        return;
      }
    }

    // Avoid saving 0 since it's useless as a timeout value.
    if (this.vaultTimeout.value === 0) {
      return;
    }

    if (!this.vaultTimeout.valid) {
      this.platformUtilsService.showToast(
        "error",
        null,
        this.i18nService.t("vaultTimeoutTooLarge")
      );
      return;
    }

    await this.vaultTimeoutService.setVaultTimeoutOptions(
      this.vaultTimeout.value,
      this.vaultTimeoutAction
    );
  }

  async updatePin() {
    if (this.pin) {
      const ref = this.modalService.open(SetPinComponent, { allowMultipleModals: true });

      if (ref == null) {
        this.pin = false;
        return;
      }

      this.pin = await ref.onClosedPromise();
    }
    if (!this.pin) {
      await this.cryptoService.clearPinProtectedKey();
      await this.vaultTimeoutService.clear();
    }
  }

  async updateBiometric() {
    const current = this.biometric;
    if (this.biometric) {
      this.biometric = false;
    } else if (this.supportsBiometric) {
      this.biometric = await this.platformUtilsService.authenticateBiometric();
    }
    if (this.biometric === current) {
      return;
    }
    if (this.biometric) {
      await this.stateService.setBiometricUnlock(true);
    } else {
      await this.stateService.setBiometricUnlock(null);
      await this.stateService.setNoAutoPromptBiometrics(null);
      this.noAutoPromptBiometrics = false;
    }
    await this.stateService.setBiometricLocked(false);
    await this.cryptoService.toggleKey();
  }

  async updateNoAutoPromptBiometrics() {
    if (!this.biometric) {
      this.noAutoPromptBiometrics = false;
    }

    if (this.noAutoPromptBiometrics) {
      await this.stateService.setNoAutoPromptBiometrics(true);
    } else {
      await this.stateService.setNoAutoPromptBiometrics(null);
    }
  }

  async saveFavicons() {
    await this.stateService.setDisableFavicon(this.disableFavicons);
    await this.stateService.setDisableFavicon(this.disableFavicons, {
      storageLocation: StorageLocation.Disk,
    });
    this.messagingService.send("refreshCiphers");
  }

  async saveMinToTray() {
    await this.stateService.setEnableMinimizeToTray(this.enableMinToTray);
  }

  async saveCloseToTray() {
    if (this.requireEnableTray) {
      this.enableTray = true;
      await this.stateService.setEnableTray(this.enableTray);
    }

    await this.stateService.setEnableCloseToTray(this.enableCloseToTray);
  }

  async saveTray() {
    if (
      this.requireEnableTray &&
      !this.enableTray &&
      (this.startToTray || this.enableCloseToTray)
    ) {
      const confirm = await this.platformUtilsService.showDialog(
        this.i18nService.t("confirmTrayDesc"),
        this.i18nService.t("confirmTrayTitle"),
        this.i18nService.t("yes"),
        this.i18nService.t("no"),
        "warning"
      );

      if (confirm) {
        this.startToTray = false;
        await this.stateService.setEnableStartToTray(this.startToTray);
        this.enableCloseToTray = false;
        await this.stateService.setEnableCloseToTray(this.enableCloseToTray);
      } else {
        this.enableTray = true;
      }

      return;
    }

    await this.stateService.setEnableTray(this.enableTray);
    this.messagingService.send(this.enableTray ? "showTray" : "removeTray");
  }

  async saveStartToTray() {
    if (this.requireEnableTray) {
      this.enableTray = true;
      await this.stateService.setEnableTray(this.enableTray);
    }

    await this.stateService.setEnableStartToTray(this.startToTray);
  }

  async saveLocale() {
    await this.stateService.setLocale(this.locale);
  }

  async saveTheme() {
    await this.stateService.setTheme(this.theme);
    window.setTimeout(() => window.location.reload(), 200);
  }

  async saveMinOnCopyToClipboard() {
    await this.stateService.setMinimizeOnCopyToClipboard(this.minimizeOnCopyToClipboard);
  }

  async saveClearClipboard() {
    await this.stateService.setClearClipboard(this.clearClipboard);
  }

  async saveAlwaysShowDock() {
    await this.stateService.setAlwaysShowDock(this.alwaysShowDock);
  }

  async saveOpenAtLogin() {
    this.stateService.setOpenAtLogin(this.openAtLogin);
    this.messagingService.send(this.openAtLogin ? "addOpenAtLogin" : "removeOpenAtLogin");
  }

  async saveBrowserIntegration() {
    if (process.platform === "darwin" && !this.platformUtilsService.isMacAppStore()) {
      await this.platformUtilsService.showDialog(
        this.i18nService.t("browserIntegrationMasOnlyDesc"),
        this.i18nService.t("browserIntegrationMasOnlyTitle"),
        this.i18nService.t("ok"),
        null,
        "warning"
      );

      this.enableBrowserIntegration = false;
      return;
    } else if (isWindowsStore()) {
      await this.platformUtilsService.showDialog(
        this.i18nService.t("browserIntegrationWindowsStoreDesc"),
        this.i18nService.t("browserIntegrationWindowsStoreTitle"),
        this.i18nService.t("ok"),
        null,
        "warning"
      );

      this.enableBrowserIntegration = false;
      return;
    }

    await this.stateService.setEnableBrowserIntegration(this.enableBrowserIntegration);
    this.messagingService.send(
      this.enableBrowserIntegration ? "enableBrowserIntegration" : "disableBrowserIntegration"
    );

    if (!this.enableBrowserIntegration) {
      this.enableBrowserIntegrationFingerprint = false;
      this.saveBrowserIntegrationFingerprint();
    }
  }

  async saveBrowserIntegrationFingerprint() {
    await this.stateService.setEnableBrowserIntegrationFingerprint(
      this.enableBrowserIntegrationFingerprint
    );
  }
}
