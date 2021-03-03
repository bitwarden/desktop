import {
    Component,
    NgZone,
} from '@angular/core';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SyncService } from 'jslib/abstractions/sync.service';
import { TokenService } from 'jslib/abstractions/token.service';

import { PremiumComponent as BasePremiumComponent } from 'jslib/angular/components/premium.component';

@Component({
    selector: 'app-premium',
    templateUrl: 'premium.component.html',
})
export class PremiumComponent extends BasePremiumComponent {
    constructor(i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        tokenService: TokenService, apiService: ApiService,
        private ngZone: NgZone, private messagingService: MessagingService,
        private syncService: SyncService) {
        super(i18nService, platformUtilsService, tokenService, apiService);
    }
}
