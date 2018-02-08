import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
} from '@angular/router';

import { CryptoService } from 'jslib/abstractions/crypto.service';
import { UserService } from 'jslib/abstractions/user.service';

@Injectable()
export class AuthGuardService implements CanActivate {
    constructor(private cryptoService: CryptoService, private userService: UserService, private router: Router) { }

    canActivate(): boolean {
        if (!this.userService.isAuthenticated()) {
            this.router.navigate(['vault']);
            return false;
        }

        if (this.cryptoService.getKey() == null) {
            this.router.navigate(['lock']);
            return false;
        }

        return true;
    }
}
