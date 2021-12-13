import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';


import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StateService } from 'jslib-common/abstractions/state.service';

@Injectable()
export class LoginGuardService implements CanActivate {
    protected homepage = 'vault';
    constructor(private stateService: StateService, private platformUtilsService: PlatformUtilsService,
        private i18nService: I18nService) { }

    async canActivate() {
        const accounts = this.stateService.accounts.getValue();
        if (accounts != null && Object.keys(accounts).length >= 5) {
            this.platformUtilsService.showToast('error', null, this.i18nService.t('accountLimitReached'));
            return false;
        }

        return true;
    }
}
