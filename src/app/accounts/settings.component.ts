import {
    Component,
    OnInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

import { DeviceType } from 'jslib-common/enums/deviceType';
import { ThemeType } from 'jslib-common/enums/themeType';

import { ActiveAccountService } from 'jslib-common/abstractions/activeAccount.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';

import { ModalService } from 'jslib-angular/services/modal.service';

import { SetPinComponent } from '../components/set-pin.component';

import { Utils } from 'jslib-common/misc/utils';
import { isWindowsStore } from 'jslib-electron/utils';

import { StorageKey } from 'jslib-common/enums/storageKey';

@Component({
    selector: 'app-settings',
    templateUrl: 'settings.component.html',
})
export class SettingsComponent implements OnInit {
    vaultTimeoutAction: string;
    pin: boolean = null;
    disableFavicons: boolean = false;
    enableBrowserIntegration: boolean = false;
    enableBrowserIntegrationFingerprint: boolean = false;
    enableMinToTray: boolean = false;
    enableCloseToTray: boolean = false;
    enableTray: boolean = false;
    showMinToTray: boolean = false;
    startToTray: boolean = false;
    minimizeOnCopyToClipboard: boolean = false;
    locale: string;
    vaultTimeouts: any[];
    localeOptions: any[];
    theme: string;
    themeOptions: any[];
    clearClipboard: number;
    clearClipboardOptions: any[];
    supportsBiometric: boolean;
    biometric: boolean;
    biometricText: string;
    noAutoPromptBiometrics: boolean;
    noAutoPromptBiometricsText: string;
    alwaysShowDock: boolean;
    showAlwaysShowDock: boolean = false;
    openAtLogin: boolean;
    requireEnableTray: boolean = false;

    enableTrayText: string;
    enableTrayDescText: string;
    enableMinToTrayText: string;
    enableMinToTrayDescText: string;
    enableCloseToTrayText: string;
    enableCloseToTrayDescText: string;
    startToTrayText: string;
    startToTrayDescText: string;

    vaultTimeout: FormControl = new FormControl(null);

    constructor(private i18nService: I18nService, private platformUtilsService: PlatformUtilsService,
        private vaultTimeoutService: VaultTimeoutService, private stateService: StateService,
        private messagingService: MessagingService, private cryptoService: CryptoService,
        private modalService: ModalService, private activeAccount: ActiveAccountService,
        private storageService: StorageService) {
        const isMac = this.platformUtilsService.getDevice() === DeviceType.MacOsDesktop;

        // Workaround to avoid ghosting trays https://github.com/electron/electron/issues/17622
        this.requireEnableTray = this.platformUtilsService.getDevice() === DeviceType.LinuxDesktop;

        const trayKey = isMac ? 'enableMenuBar' : 'enableTray';
        this.enableTrayText = this.i18nService.t(trayKey);
        this.enableTrayDescText = this.i18nService.t(trayKey + 'Desc');

        const minToTrayKey = isMac ? 'enableMinToMenuBar' : 'enableMinToTray';
        this.enableMinToTrayText = this.i18nService.t(minToTrayKey);
        this.enableMinToTrayDescText = this.i18nService.t(minToTrayKey + 'Desc');

        const closeToTrayKey = isMac ? 'enableCloseToMenuBar' : 'enableCloseToTray';
        this.enableCloseToTrayText = this.i18nService.t(closeToTrayKey);
        this.enableCloseToTrayDescText = this.i18nService.t(closeToTrayKey + 'Desc');

        const startToTrayKey = isMac ? 'startToMenuBar' : 'startToTray';
        this.startToTrayText = this.i18nService.t(startToTrayKey);
        this.startToTrayDescText = this.i18nService.t(startToTrayKey + 'Desc');

        this.vaultTimeouts = [
            // { name: i18nService.t('immediately'), value: 0 },
            { name: i18nService.t('oneMinute'), value: 1 },
            { name: i18nService.t('fiveMinutes'), value: 5 },
            { name: i18nService.t('fifteenMinutes'), value: 15 },
            { name: i18nService.t('thirtyMinutes'), value: 30 },
            { name: i18nService.t('oneHour'), value: 60 },
            { name: i18nService.t('fourHours'), value: 240 },
            { name: i18nService.t('onIdle'), value: -4 },
            { name: i18nService.t('onSleep'), value: -3 },
        ];

        if (this.platformUtilsService.getDevice() !== DeviceType.LinuxDesktop) {
            this.vaultTimeouts.push({ name: i18nService.t('onLocked'), value: -2 });
        }

        this.vaultTimeouts = this.vaultTimeouts.concat([
            { name: i18nService.t('onRestart'), value: -1 },
            { name: i18nService.t('never'), value: null },
        ]);

        this.vaultTimeout.valueChanges.pipe(debounceTime(500)).subscribe(() => {
            this.saveVaultTimeoutOptions();
        });

        const localeOptions: any[] = [];
        i18nService.supportedTranslationLocales.forEach(locale => {
            let name = locale;
            if (i18nService.localeNames.has(locale)) {
                name += (' - ' + i18nService.localeNames.get(locale));
            }
            localeOptions.push({ name: name, value: locale });
        });
        localeOptions.sort(Utils.getSortFunction(i18nService, 'name'));
        localeOptions.splice(0, 0, { name: i18nService.t('default'), value: null });
        this.localeOptions = localeOptions;

        this.themeOptions = [
            { name: i18nService.t('default'), value: null },
            { name: i18nService.t('light'), value: ThemeType.Light },
            { name: i18nService.t('dark'), value: ThemeType.Dark },
            { name: 'Nord', value: ThemeType.Nord },
        ];

        this.clearClipboardOptions = [
            { name: i18nService.t('never'), value: null },
            { name: i18nService.t('tenSeconds'), value: 10 },
            { name: i18nService.t('twentySeconds'), value: 20 },
            { name: i18nService.t('thirtySeconds'), value: 30 },
            { name: i18nService.t('oneMinute'), value: 60 },
            { name: i18nService.t('twoMinutes'), value: 120 },
            { name: i18nService.t('fiveMinutes'), value: 300 },
        ];
    }

    async ngOnInit() {
        this.showMinToTray = this.platformUtilsService.getDevice() !== DeviceType.LinuxDesktop;
        this.vaultTimeout.setValue(await this.activeAccount.getInformation<number>(StorageKey.VaultTimeout) ?? 1);
        this.vaultTimeoutAction = await this.activeAccount.getInformation<string>(StorageKey.VaultTimeoutAction) ?? 'lock';
        const pinSet = await this.vaultTimeoutService.isPinLockSet();
        this.pin = pinSet[0] || pinSet[1];
        this.disableFavicons = await this.storageService.get(StorageKey.DisableFavicon) ?? false;
        this.enableBrowserIntegration = await this.activeAccount.getInformation<boolean>(
            StorageKey.EnableBrowserIntegration);
        this.enableBrowserIntegrationFingerprint = await this.activeAccount.getInformation<boolean>(StorageKey.EnableBrowserIntegrationFingerprint);
        this.enableMinToTray = await this.activeAccount.getInformation<boolean>(StorageKey.EnableMinimizeToTrayKey);
        this.enableCloseToTray = await this.activeAccount.getInformation<boolean>(StorageKey.EnableCloseToTrayKey);
        this.enableTray = await this.activeAccount.getInformation<boolean>(StorageKey.EnableTrayKey);
        this.startToTray = await this.activeAccount.getInformation<boolean>(StorageKey.EnableStartToTrayKey);
        this.locale = await this.activeAccount.getInformation<string>(StorageKey.Locale);
        this.theme = await this.activeAccount.getInformation<string>(StorageKey.Theme);
        this.clearClipboard = await this.activeAccount.getInformation<number>(StorageKey.ClearClipboard);
        this.minimizeOnCopyToClipboard = await this.activeAccount.getInformation<boolean>(
            StorageKey.MinimizeOnCopyToClipboardKey);
        this.supportsBiometric = await this.platformUtilsService.supportsBiometric();
        this.biometric = await this.vaultTimeoutService.isBiometricLockSet();
        this.biometricText = await this.activeAccount.getInformation<string>(StorageKey.BiometricText);
        this.noAutoPromptBiometrics = await this.activeAccount.getInformation<boolean>(StorageKey.NoAutoPromptBiometrics);
        this.noAutoPromptBiometricsText = await this.activeAccount.getInformation<string>(StorageKey.NoAutoPromptBiometricsText);
        this.alwaysShowDock = await this.activeAccount.getInformation<boolean>(StorageKey.AlwaysShowDock);
        this.showAlwaysShowDock = this.platformUtilsService.getDevice() === DeviceType.MacOsDesktop;
        this.openAtLogin = await this.activeAccount.getInformation<boolean>(StorageKey.OpenAtLogin);
    }

    async saveVaultTimeoutOptions() {
        if (this.vaultTimeoutAction === 'logOut') {
            const confirmed = await this.platformUtilsService.showDialog(
                this.i18nService.t('vaultTimeoutLogOutConfirmation'),
                this.i18nService.t('vaultTimeoutLogOutConfirmationTitle'),
                this.i18nService.t('yes'), this.i18nService.t('cancel'), 'warning');
            if (!confirmed) {
                this.vaultTimeoutAction = 'lock';
                return;
            }
        }

        // Avoid saving 0 since it's useless as a timeout value.
        if (this.vaultTimeout.value === 0) {
            return;
        }

        if (!this.vaultTimeout.valid) {
            this.platformUtilsService.showToast('error', null, this.i18nService.t('vaultTimeoutTooLarge'));
            return;
        }

        await this.vaultTimeoutService.setVaultTimeoutOptions(this.vaultTimeout.value, this.vaultTimeoutAction);
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
            await this.activeAccount.saveInformation(StorageKey.BiometricUnlock, true);
        } else {
            await this.activeAccount.removeInformation(StorageKey.BiometricUnlock);
            await this.activeAccount.removeInformation(StorageKey.NoAutoPromptBiometrics);
            this.noAutoPromptBiometrics = false;
        }
        this.vaultTimeoutService.biometricLocked = false;
        await this.cryptoService.toggleKey();
    }

    async updateNoAutoPromptBiometrics() {
        if (!this.biometric) {
            this.noAutoPromptBiometrics = false;
        }

        if (this.noAutoPromptBiometrics) {
            await this.activeAccount.saveInformation(StorageKey.NoAutoPromptBiometrics, true);
        } else {
            await this.activeAccount.removeInformation(StorageKey.NoAutoPromptBiometrics);
        }
    }

    async saveFavicons() {
        await this.activeAccount.saveInformation(StorageKey.DisableFavicon, this.disableFavicons);
        await this.stateService.save(StorageKey.DisableFavicon, this.disableFavicons);
        this.messagingService.send('refreshCiphers');
    }

    async saveMinToTray() {
        await this.activeAccount.saveInformation(StorageKey.EnableMinimizeToTrayKey, this.enableMinToTray);
    }

    async saveCloseToTray() {
        if (this.requireEnableTray) {
            this.enableTray = true;
            await this.activeAccount.saveInformation(StorageKey.EnableTrayKey, this.enableTray);
        }

        await this.activeAccount.saveInformation(StorageKey.EnableCloseToTrayKey, this.enableCloseToTray);
    }

    async saveTray() {
        if (this.requireEnableTray && !this.enableTray && (this.startToTray || this.enableCloseToTray)) {
            const confirm = await this.platformUtilsService.showDialog(
                this.i18nService.t('confirmTrayDesc'), this.i18nService.t('confirmTrayTitle'),
                this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');

            if (confirm) {
                this.startToTray = false;
                await this.activeAccount.saveInformation(StorageKey.EnableStartToTrayKey, this.startToTray);
                this.enableCloseToTray = false;
                await this.activeAccount.saveInformation(StorageKey.EnableCloseToTrayKey, this.enableCloseToTray);
            } else {
                this.enableTray = true;
            }

            return;
        }

        await this.activeAccount.saveInformation(StorageKey.EnableTrayKey, this.enableTray);
        this.messagingService.send(this.enableTray ? 'showTray' : 'removeTray');
    }

    async saveStartToTray() {
        if (this.requireEnableTray) {
            this.enableTray = true;
            await this.activeAccount.saveInformation(StorageKey.EnableTrayKey, this.enableTray);
        }

        await this.activeAccount.saveInformation(StorageKey.EnableStartToTrayKey, this.startToTray);
    }

    async saveLocale() {
        await this.activeAccount.saveInformation(StorageKey.Locale, this.locale);
    }

    async saveTheme() {
        await this.activeAccount.saveInformation(StorageKey.Theme, this.theme);
        await this.storageService.save(`global.${StorageKey.Theme}`, this.theme);
        window.setTimeout(() => window.location.reload(), 200);
    }

    async saveMinOnCopyToClipboard() {
        await this.activeAccount.saveInformation(StorageKey.MinimizeOnCopyToClipboardKey, this.minimizeOnCopyToClipboard);
    }

    async saveClearClipboard() {
        await this.activeAccount.saveInformation(StorageKey.ClearClipboard, this.clearClipboard);
    }

    async saveAlwaysShowDock() {
        await this.activeAccount.saveInformation(StorageKey.AlwaysShowDock, this.alwaysShowDock);
    }

    async saveOpenAtLogin() {
        this.activeAccount.saveInformation(StorageKey.OpenAtLogin, this.openAtLogin);
        this.messagingService.send(this.openAtLogin ? 'addOpenAtLogin' : 'removeOpenAtLogin');
    }

    async saveBrowserIntegration() {
        if (process.platform === 'darwin' && !this.platformUtilsService.isMacAppStore()) {
            await this.platformUtilsService.showDialog(
                this.i18nService.t('browserIntegrationMasOnlyDesc'),
                this.i18nService.t('browserIntegrationMasOnlyTitle'),
                this.i18nService.t('ok'), null, 'warning');

            this.enableBrowserIntegration = false;
            return;
        } else if (isWindowsStore()) {
            await this.platformUtilsService.showDialog(
                this.i18nService.t('browserIntegrationWindowsStoreDesc'),
                this.i18nService.t('browserIntegrationWindowsStoreTitle'),
                this.i18nService.t('ok'), null, 'warning');

            this.enableBrowserIntegration = false;
            return;
        }

        await this.activeAccount.saveInformation(StorageKey.EnableBrowserIntegration, this.enableBrowserIntegration);
        this.messagingService.send(this.enableBrowserIntegration ? 'enableBrowserIntegration' : 'disableBrowserIntegration');

        if (!this.enableBrowserIntegration) {
            this.enableBrowserIntegrationFingerprint = false;
            this.saveBrowserIntegrationFingerprint();
        }
    }

    async saveBrowserIntegrationFingerprint() {
        await this.activeAccount.saveInformation(StorageKey.EnableBrowserIntegrationFingerprint, this.enableBrowserIntegrationFingerprint);
    }
}
