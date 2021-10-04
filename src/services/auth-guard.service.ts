import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
} from '@angular/router';

import { MessagingService } from 'jslib/abstractions/messaging.service';
import { UserService } from 'jslib/abstractions/user.service';
import { VaultTimeoutService } from 'jslib/abstractions/vaultTimeout.service';

@Injectable()
export class AuthGuardService implements CanActivate {
    constructor(private vaultTimeoutService: VaultTimeoutService, private userService: UserService,
        private router: Router, private messagingService: MessagingService) { }

    async canActivate(route: ActivatedRouteSnapshot, routerState: RouterStateSnapshot) {
        const isAuthed = await this.userService.isAuthenticated();
        if (!isAuthed) {
            // @override by Cozy
            this.messagingService.send('authBlocked', { url: routerState.url });
            // end Cozy override
            return false;
        }

        const locked = await this.vaultTimeoutService.isLocked();
        if (locked) {
            if (routerState != null) {
                this.messagingService.send('lockedUrl', { url: routerState.url });
            }
            this.router.navigate(['lock'], { queryParams: { promptBiometric: true }});
            return false;
        }

        return true;
    }
}
