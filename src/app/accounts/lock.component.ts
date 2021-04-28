import {
    Component,
    NgZone,
    OnDestroy,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';

import { BroadcasterService } from 'jslib-angular/services/broadcaster.service';

import { LockComponent as BaseLockComponent } from 'jslib-angular/components/lock.component';

const BroadcasterSubscriptionId = 'LockComponent';

@Component({
    selector: 'app-lock',
    templateUrl: 'lock.component.html',
})
export class LockComponent extends BaseLockComponent implements OnDestroy {
    constructor(router: Router, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, messagingService: MessagingService,
        userService: UserService, cryptoService: CryptoService,
        storageService: StorageService, vaultTimeoutService: VaultTimeoutService,
        environmentService: EnvironmentService, stateService: StateService,
        apiService: ApiService, private route: ActivatedRoute,
        private broadcasterService: BroadcasterService, private ngZone: NgZone) {
        super(router, i18nService, platformUtilsService, messagingService, userService, cryptoService,
            storageService, vaultTimeoutService, environmentService, stateService, apiService);
    }

    async ngOnInit() {
        await super.ngOnInit();
        this.route.queryParams.subscribe(params => {
            if (this.supportsBiometric && params.promptBiometric) {
                setTimeout(() => this.unlockBiometric(), 1000);
            }
        });
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
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    onWindowHidden() {
        this.showPassword = false;
    }
}
