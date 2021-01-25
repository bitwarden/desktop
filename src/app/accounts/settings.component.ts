import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';
import Swal from 'sweetalert2/src/sweetalert2.js';

import { DeviceType } from 'jslib/enums/deviceType';

import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { UserService } from 'jslib/abstractions/user.service';
import { VaultTimeoutService } from 'jslib/abstractions/vaultTimeout.service';

import { ConstantsService } from 'jslib/services/constants.service';

import { ElectronConstants } from 'jslib/electron/electronConstants';

import { Utils } from 'jslib/misc/utils';
import { isWindowsStore } from 'jslib/electron/utils';

@Component({
    selector: 'app-settings',
    templateUrl: 'settings.component.html',
})
export class SettingsComponent implements OnInit {
    vaultTimeout: number = null;
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

    constructor(private analytics: Angulartics2, private toasterService: ToasterService,
        private i18nService: I18nService, private platformUtilsService: PlatformUtilsService,
        private storageService: StorageService, private vaultTimeoutService: VaultTimeoutService,
        private stateService: StateService, private messagingService: MessagingService,
        private userService: UserService, private cryptoService: CryptoService) {
        const isMac = this.platformUtilsService.getDevice() === DeviceType.MacOsDesktop;

        // Workaround to avoid ghosting trays https://github.com/electron/electron/issues/17622
        this.requireEnableTray = this.platformUtilsService.getDevice() === DeviceType.LinuxDesktop;

        const trayKey = isMac ? 'enableMenuBar' : 'enableTray';
        this.enableTrayText = this.i18nService.t(trayKey);
        this.enableTrayDescText = this.i18nService.t(trayKey + 'Desc');

        const minToTrayKey = isMac ? 'enableMinToMenuBar' : 'enableMinToTray';
        this.enableMinToTrayText = this.i18nService.t(minToTrayKey)
        this.enableMinToTrayDescText = this.i18nService.t(minToTrayKey + 'Desc');

        const closeToTrayKey = isMac ? 'enableCloseToMenuBar' : 'enableCloseToTray';
        this.enableCloseToTrayText = this.i18nService.t(closeToTrayKey)
        this.enableCloseToTrayDescText = this.i18nService.t(closeToTrayKey + 'Desc');

        const startToTrayKey = isMac ? 'startToMenuBar' : 'startToTray';
        this.startToTrayText = this.i18nService.t(startToTrayKey)
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

        const localeOptions: any[] = [];
        i18nService.supportedTranslationLocales.forEach((locale) => {
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
            { name: i18nService.t('light'), value: 'light' },
            { name: i18nService.t('dark'), value: 'dark' },
            { name: 'Nord', value: 'nord' },
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
        this.vaultTimeout = await this.storageService.get<number>(ConstantsService.vaultTimeoutKey);
        this.vaultTimeoutAction = await this.storageService.get<string>(ConstantsService.vaultTimeoutActionKey);
        const pinSet = await this.vaultTimeoutService.isPinLockSet();
        this.pin = pinSet[0] || pinSet[1];
        this.disableFavicons = await this.storageService.get<boolean>(ConstantsService.disableFaviconKey);
        this.enableBrowserIntegration = await this.storageService.get<boolean>(
            ElectronConstants.enableBrowserIntegration);
        this.enableBrowserIntegrationFingerprint = await this.storageService.get<boolean>(ElectronConstants.enableBrowserIntegrationFingerprint);
        this.enableMinToTray = await this.storageService.get<boolean>(ElectronConstants.enableMinimizeToTrayKey);
        this.enableCloseToTray = await this.storageService.get<boolean>(ElectronConstants.enableCloseToTrayKey);
        this.enableTray = await this.storageService.get<boolean>(ElectronConstants.enableTrayKey);
        this.startToTray = await this.storageService.get<boolean>(ElectronConstants.enableStartToTrayKey);
        this.locale = await this.storageService.get<string>(ConstantsService.localeKey);
        this.theme = await this.storageService.get<string>(ConstantsService.themeKey);
        this.clearClipboard = await this.storageService.get<number>(ConstantsService.clearClipboardKey);
        this.minimizeOnCopyToClipboard = await this.storageService.get<boolean>(
            ElectronConstants.minimizeOnCopyToClipboardKey);
        this.supportsBiometric = await this.platformUtilsService.supportsBiometric();
        this.biometric = await this.vaultTimeoutService.isBiometricLockSet();
        this.biometricText = await this.storageService.get<string>(ConstantsService.biometricText);
        this.alwaysShowDock = await this.storageService.get<boolean>(ElectronConstants.alwaysShowDock);
        this.showAlwaysShowDock = this.platformUtilsService.getDevice() === DeviceType.MacOsDesktop;
        this.openAtLogin = await this.storageService.get<boolean>(ElectronConstants.openAtLogin);
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
        await this.vaultTimeoutService.setVaultTimeoutOptions(this.vaultTimeout != null ? this.vaultTimeout : null,
            this.vaultTimeoutAction);
    }

    async updatePin() {
        if (this.pin) {
            const div = document.createElement('div');
            const label = document.createElement('label');
            label.className = 'checkbox';
            const checkboxText = document.createElement('span');
            const restartText = document.createTextNode(this.i18nService.t('lockWithMasterPassOnRestart'));
            checkboxText.appendChild(restartText);
            label.innerHTML = '<input type="checkbox" id="master-pass-restart" checked>';
            label.appendChild(checkboxText);

            div.innerHTML =
                `<div class="swal2-text">${this.i18nService.t('setYourPinCode')}</div>` +
                '<input type="text" class="swal2-input" id="pin-val" autocomplete="off" ' +
                'autocapitalize="none" autocorrect="none" spellcheck="false" inputmode="verbatim">';

            (div.querySelector('#pin-val') as HTMLInputElement).placeholder = this.i18nService.t('pin');
            div.appendChild(label);

            const submitted = await Swal.fire({
                heightAuto: false,
                buttonsStyling: false,
                html: div,
                showCancelButton: true,
                cancelButtonText: this.i18nService.t('cancel'),
                showConfirmButton: true,
                confirmButtonText: this.i18nService.t('submit'),
            });

            let pin: string = null;
            let masterPassOnRestart: boolean = null;
            if (submitted.value) {
                pin = (document.getElementById('pin-val') as HTMLInputElement).value;
                masterPassOnRestart = (document.getElementById('master-pass-restart') as HTMLInputElement).checked;
            }
            if (pin != null && pin.trim() !== '') {
                const kdf = await this.userService.getKdf();
                const kdfIterations = await this.userService.getKdfIterations();
                const email = await this.userService.getEmail();
                const pinKey = await this.cryptoService.makePinKey(pin, email, kdf, kdfIterations);
                const key = await this.cryptoService.getKey();
                const pinProtectedKey = await this.cryptoService.encrypt(key.key, pinKey);
                if (masterPassOnRestart) {
                    const encPin = await this.cryptoService.encrypt(pin);
                    await this.storageService.save(ConstantsService.protectedPin, encPin.encryptedString);
                    this.vaultTimeoutService.pinProtectedKey = pinProtectedKey;
                } else {
                    await this.storageService.save(ConstantsService.pinProtectedKey, pinProtectedKey.encryptedString);
                }
            } else {
                this.pin = false;
            }
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
            await this.storageService.save(ConstantsService.biometricUnlockKey, true);
        } else {
            await this.storageService.remove(ConstantsService.biometricUnlockKey);
        }
        this.vaultTimeoutService.biometricLocked = false;
        await this.cryptoService.toggleKey();
    }

    async saveFavicons() {
        await this.storageService.save(ConstantsService.disableFaviconKey, this.disableFavicons);
        await this.stateService.save(ConstantsService.disableFaviconKey, this.disableFavicons);
        this.messagingService.send('refreshCiphers');
        this.callAnalytics('Favicons', !this.disableFavicons);
    }

    async saveMinToTray() {
        await this.storageService.save(ElectronConstants.enableMinimizeToTrayKey, this.enableMinToTray);
        this.callAnalytics('MinimizeToTray', this.enableMinToTray);
    }

    async saveCloseToTray() {
        if (this.requireEnableTray) {
            this.enableTray = true;
            await this.storageService.save(ElectronConstants.enableTrayKey, this.enableTray);
        }

        await this.storageService.save(ElectronConstants.enableCloseToTrayKey, this.enableCloseToTray);
        this.callAnalytics('CloseToTray', this.enableCloseToTray);
    }

    async saveTray() {
        if (this.requireEnableTray && !this.enableTray && (this.startToTray || this.enableCloseToTray)) {
            const confirm = await this.platformUtilsService.showDialog(
                this.i18nService.t('confirmTrayDesc'), this.i18nService.t('confirmTrayTitle'),
                this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');

            if (confirm) {
                this.startToTray = false;
                await this.storageService.save(ElectronConstants.enableStartToTrayKey, this.startToTray);
                this.enableCloseToTray = false;
                await this.storageService.save(ElectronConstants.enableCloseToTrayKey, this.enableCloseToTray);
            } else {
                this.enableTray = true;
            }

            return;
        }

        await this.storageService.save(ElectronConstants.enableTrayKey, this.enableTray);
        this.callAnalytics('Tray', this.enableTray);
        this.messagingService.send(this.enableTray ? 'showTray' : 'removeTray');
    }

    async saveStartToTray() {
        if (this.requireEnableTray) {
            this.enableTray = true;
            await this.storageService.save(ElectronConstants.enableTrayKey, this.enableTray);
        }

        await this.storageService.save(ElectronConstants.enableStartToTrayKey, this.startToTray);
        this.callAnalytics('StartToTray', this.startToTray);
    }

    async saveLocale() {
        await this.storageService.save(ConstantsService.localeKey, this.locale);
        this.analytics.eventTrack.next({ action: 'Set Locale ' + this.locale });
    }

    async saveTheme() {
        await this.storageService.save(ConstantsService.themeKey, this.theme);
        this.analytics.eventTrack.next({ action: 'Set Theme ' + this.theme });
        window.setTimeout(() => window.location.reload(), 200);
    }

    async saveMinOnCopyToClipboard() {
        await this.storageService.save(ElectronConstants.minimizeOnCopyToClipboardKey, this.minimizeOnCopyToClipboard);
        this.callAnalytics('MinOnCopyToClipboard', this.minimizeOnCopyToClipboard);
    }

    async saveClearClipboard() {
        await this.storageService.save(ConstantsService.clearClipboardKey, this.clearClipboard);
        this.analytics.eventTrack.next({
            action: 'Set Clear Clipboard ' + (this.clearClipboard == null ? 'Disabled' : this.clearClipboard),
        });
    }

    async saveAlwaysShowDock() {
        await this.storageService.save(ElectronConstants.alwaysShowDock, this.alwaysShowDock);
    }

    async saveOpenAtLogin() {
        this.storageService.save(ElectronConstants.openAtLogin, this.openAtLogin);
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

        await this.storageService.save(ElectronConstants.enableBrowserIntegration, this.enableBrowserIntegration);
        this.messagingService.send(this.enableBrowserIntegration ? 'enableBrowserIntegration' : 'disableBrowserIntegration');

        if (!this.enableBrowserIntegration) {
            this.enableBrowserIntegrationFingerprint = false;
            this.saveBrowserIntegrationFingerprint();
        }
    }

    async saveBrowserIntegrationFingerprint() {
        await this.storageService.save(ElectronConstants.enableBrowserIntegrationFingerprint, this.enableBrowserIntegrationFingerprint);
    }

    private callAnalytics(name: string, enabled: boolean) {
        const status = enabled ? 'Enabled' : 'Disabled';
        this.analytics.eventTrack.next({ action: `${status} ${name}` });
    }
}
