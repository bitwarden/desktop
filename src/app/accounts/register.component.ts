import {
    Component,
    NgZone,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { AuthService } from 'jslib-common/abstractions/auth.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib-common/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StateService } from 'jslib-common/abstractions/state.service';

import { BroadcasterService } from 'jslib-angular/services/broadcaster.service';

import { RegisterComponent as BaseRegisterComponent } from 'jslib-angular/components/register.component';

const BroadcasterSubscriptionId = 'RegisterComponent';

@Component({
    selector: 'app-register',
    templateUrl: 'register.component.html',
})
export class RegisterComponent extends BaseRegisterComponent implements OnInit, OnDestroy {
    constructor(authService: AuthService, router: Router,
        i18nService: I18nService, cryptoService: CryptoService,
        apiService: ApiService, stateService: StateService,
        platformUtilsService: PlatformUtilsService, passwordGenerationService: PasswordGenerationService,
        environmentService: EnvironmentService, private broadcasterService: BroadcasterService,
        private ngZone: NgZone) {
        super(authService, router, i18nService, cryptoService, apiService, stateService, platformUtilsService,
            passwordGenerationService, environmentService);
    }

    async ngOnInit() {
        this.broadcasterService.subscribe(BroadcasterSubscriptionId, async (message: any) => {
            this.ngZone.run(() => {
                switch (message.command) {
                    case 'windowHidden':
                        this.onWindowHidden();
                        break;
                    default:
                }
            });
        });

        super.ngOnInit();
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    onWindowHidden() {
        this.showPassword = false;
    }
}
