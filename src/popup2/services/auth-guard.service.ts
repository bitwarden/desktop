import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
} from '@angular/router';

import { CryptoService } from 'jslib/abstractions/crypto.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { UserService } from 'jslib/abstractions/user.service';

@Injectable()
export class AuthGuardService implements CanActivate {
    constructor(private cryptoService: CryptoService, private userService: UserService, private router: Router,
        private messagingService: MessagingService) { }

    async canActivate() {
        const isAuthed = await this.userService.isAuthenticated();
        if (!isAuthed) {
            this.messagingService.send('logout');
            return false;
        }

        const key = await this.cryptoService.getKey();
        if (key == null) {
            this.router.navigate(['lock']);
            return false;
        }

        return true;
    }
}
