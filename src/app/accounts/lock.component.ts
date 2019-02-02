import {
    Component,
    NgZone,
    OnDestroy,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { UserService } from 'jslib/abstractions/user.service';

import { ConstantsService } from 'jslib/services/constants.service';

import { LockComponent as BaseLockComponent } from 'jslib/angular/components/lock.component';

@Component({
    selector: 'app-lock',
    templateUrl: 'lock.component.html',
})
export class LockComponent extends BaseLockComponent implements OnDestroy {
    private reloadInterval: number = null;

    constructor(router: Router, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, messagingService: MessagingService,
        userService: UserService, cryptoService: CryptoService,
        private ngZone: NgZone, private route: ActivatedRoute,
        private storageService: StorageService) {
        super(router, i18nService, platformUtilsService, messagingService, userService, cryptoService);
    }

    async ngOnInit() {
        await super.ngOnInit();
        this.route.queryParams.subscribe((params) => {
            if (params.refresh === 'true') {
                // Refresh the renderer window when locked to enure that all purged memory is cleaned up
                this.ngZone.runOutsideAngular(() => {
                    this.reloadInterval = window.setInterval(async () => {
                        let doRefresh = false;
                        const lastActive = await this.storageService.get<number>(ConstantsService.lastActiveKey);
                        if (lastActive != null) {
                            const diffSeconds = (new Date()).getTime() - lastActive;
                            // Don't refresh if they are still active in the window
                            doRefresh = diffSeconds >= 5000;
                        }
                        if (doRefresh) {
                            window.clearInterval(this.reloadInterval);
                            this.reloadInterval = null;
                            window.location.reload(true);
                        }
                    }, 10000);
                });
                this.router.navigate([], {
                    relativeTo: this.route,
                    queryParams: {},
                    replaceUrl: true,
                });
            }
        });
    }

    ngOnDestroy() {
        if (this.reloadInterval != null) {
            window.clearInterval(this.reloadInterval);
        }
    }
}
