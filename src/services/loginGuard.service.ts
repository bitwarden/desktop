import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
} from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { StateService } from 'jslib-common/abstractions/state.service';

@Injectable()
export class LoginGuardService implements CanActivate {
    protected homepage = 'vault';
    constructor(private stateService: StateService, private router: Router,
        private toasterService: ToasterService, private i18nService: I18nService) { }

    async canActivate() {
        const accounts = this.stateService.accounts.getValue();
        if (accounts != null && Object.keys(accounts).length >= 5) {
            this.toasterService.popAsync('error', null, this.i18nService.t('accountLimitReached'));
            this.router.navigate(['vault']);
        }

        return true;
    }
}
