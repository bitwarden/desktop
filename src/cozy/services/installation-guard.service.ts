import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    RouterStateSnapshot,
} from '@angular/router';
import { MessagingService } from '../../../jslib/src/abstractions/messaging.service';
import { CozyClientService } from './cozy-client.service';

// @ts-ignore
import flag from 'cozy-flags';
import { FORCE_VAULT_UNCONFIGURED } from '../flags';

@Injectable({ providedIn: 'root' })
export class VaultInstallationService {
    userFinishedInstallation = false;

    constructor(private clientService: CozyClientService) {}

    async IsVaultInstalled(): Promise<boolean> {
        const client = this.clientService.GetClient();
        const vault = await client.stackClient.fetchJSON(
            'GET',
            '/data/io.cozy.settings/io.cozy.settings.bitwarden',
            []
        );

        return !flag(FORCE_VAULT_UNCONFIGURED) && (vault.extension_installed || this.userFinishedInstallation);
    }

    setIsInstalled() {
        this.userFinishedInstallation = true;
    }
}

@Injectable({ providedIn: 'root' })
export class VaultInstalledGuardService implements CanActivate {
    constructor(
        private vaultInstallationService: VaultInstallationService,
        private messagingService: MessagingService
    ) {}

    async canActivate(
        route: ActivatedRouteSnapshot,
        routerState: RouterStateSnapshot
    ) {
        const isInstalled =
            await this.vaultInstallationService.IsVaultInstalled();

        if (!isInstalled) {
            this.messagingService.send('installBlocked');
            return false;
        }

        return true;
    }
}

@Injectable({ providedIn: 'root' })
export class VaultUninstalledGuardService implements CanActivate {
    constructor(
        private vaultInstallationService: VaultInstallationService,
        private messagingService: MessagingService
    ) {}

    async canActivate(
        route: ActivatedRouteSnapshot,
        routerState: RouterStateSnapshot
    ) {
        const isInstalled =
            await this.vaultInstallationService.IsVaultInstalled();

        if (isInstalled) {
            this.messagingService.send('uninstallBlocked');
            return false;
        }

        return true;
    }
}
