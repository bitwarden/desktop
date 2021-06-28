import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    RouterStateSnapshot,
} from '@angular/router';
import { MessagingService } from '../../../jslib/src/abstractions/messaging.service';
import { CozyClientService, IsInstalled } from './cozy-client.service';

@Injectable({ providedIn: 'root' })
export class VaultInstallationService {
    constructor(private clientService: CozyClientService) {}

    async IsVaultInstalled(): Promise<boolean> {
        return IsInstalled.value;
    }

    setIsInstalled() {
        IsInstalled.value = true;
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
