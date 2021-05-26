import {
    Component,
    NgZone,
} from '@angular/core';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SyncService } from 'jslib/abstractions/sync.service';
import { UserService } from 'jslib/abstractions/user.service';

import { PremiumComponent as BasePremiumComponent } from 'jslib/angular/components/premium.component';

@Component({
    selector: 'app-premium',
    templateUrl: 'premium.component.html',
})
export class PremiumComponent extends BasePremiumComponent {
    constructor(i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        apiService: ApiService, userService: UserService,
        private ngZone: NgZone, private messagingService: MessagingService,
        private syncService: SyncService) {
        super(i18nService, platformUtilsService, apiService, userService);
    }
}
