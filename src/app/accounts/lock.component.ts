import {
    Component,
    OnDestroy,
    NgZone,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { UserService } from 'jslib/abstractions/user.service';
import { VaultTimeoutService } from 'jslib/abstractions/vaultTimeout.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { LockComponent as BaseLockComponent } from 'jslib/angular/components/lock.component';

import { Utils } from 'jslib/misc/utils';

const BroadcasterSubscriptionId = 'LockComponent';

@Component({
    selector: 'app-lock',
    templateUrl: 'lock.component.html',
})
export class LockComponent extends BaseLockComponent implements OnDestroy {

    private isInCozyApp: boolean;
    private baseUrl: string;

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
        // @override by Cozy
        // check if code is run into a Cozy app
        // if yes, retrive url and user email
        const cozyDataNode = document.getElementById('cozy-app');
        const cozyDomain = cozyDataNode ? cozyDataNode.dataset.cozyDomain : null;
        if (cozyDomain) {
            this.isInCozyApp = true;
            this.email = `me@${cozyDomain}`;
            this.baseUrl = `https://${cozyDomain}/`;
            this.environmentService.setUrls({
                base: this.baseUrl + 'bitwarden',
            });
            const vaultUrl = this.environmentService.getWebVaultUrl();
            this.webVaultHostname = Utils.getHostname(vaultUrl);
        }
        // end Cozy override
        this.route.queryParams.subscribe((params) => {
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
