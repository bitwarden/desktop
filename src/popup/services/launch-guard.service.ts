import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
} from '@angular/router';

import { CryptoService } from 'jslib/abstractions/crypto.service';
import { UserService } from 'jslib/abstractions/user.service';

@Injectable()
export class LaunchGuardService implements CanActivate {
    constructor(private cryptoService: CryptoService, private userService: UserService, private router: Router) { }

    async canActivate() {
        const isAuthed = await this.userService.isAuthenticated();
        if (!isAuthed) {
            return true;
        }

        const key = await this.cryptoService.getKey();
        if (key == null) {
            this.router.navigate(['lock']);
        } else {
            this.router.navigate(['tabs/current']);
        }

        return false;
    }
}
