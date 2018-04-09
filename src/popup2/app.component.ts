import {
    ToasterConfig,
    ToasterContainerComponent,
} from 'angular2-toaster';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

import {
    Component,
    OnInit,
} from '@angular/core';
import {
    NavigationEnd,
    Router,
    RouterOutlet,
} from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { BrowserApi } from '../browser/browserApi';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { AuthService } from 'jslib/abstractions/auth.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';

import { ConstantsService } from 'jslib/services/constants.service';

import { routerTransition } from './app-routing.animations';

@Component({
    selector: 'app-root',
    styles: [],
    animations: [routerTransition],
    template: `
        <toaster-container [toasterconfig]="toasterConfig"></toaster-container>
        <main [@routerTransition]="getState(o)">
            <router-outlet #o="outlet"></router-outlet>
        </main>`,
})
export class AppComponent implements OnInit {
    toasterConfig: ToasterConfig = new ToasterConfig({
        showCloseButton: true,
        mouseoverTimerStop: true,
        animation: 'slideUp',
        limit: 2,
        positionClass: 'toast-bottom-full-width',
        newestOnTop: false
    });

    private lastActivity: number = null;
    private previousUrl: string = '';

    constructor(private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics, private analytics: Angulartics2,
        private toasterService: ToasterService, private storageService: StorageService,
        private broadcasterService: BroadcasterService, private authService: AuthService,
        private i18nService: I18nService, private router: Router,
        private stateService: StateService) { }

    ngOnInit() {
        window.onmousemove = () => this.recordActivity();
        window.onmousedown = () => this.recordActivity();
        window.ontouchstart = () => this.recordActivity();
        window.onclick = () => this.recordActivity();
        window.onscroll = () => this.recordActivity();
        window.onkeypress = () => this.recordActivity();

        (window as any).bitwardenPopupMainMessageListener = (msg: any, sender: any, sendResponse: any) => {
            if (msg.command === 'doneLoggingOut') {
                this.authService.logOut(() => {
                    this.analytics.eventTrack.next({ action: 'Logged Out' });
                    if (msg.expired) {
                        this.toasterService.popAsync('warning', this.i18nService.t('loggedOut'),
                            this.i18nService.t('loginExpired'));
                    }
                    this.router.navigate(['home']);
                });
            } else {
                msg.webExtSender = sender;
                this.broadcasterService.send(msg);
            }
        };

        BrowserApi.messageListener((window as any).bitwardenPopupMainMessageListener);

        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                const url = event.urlAfterRedirects || event.url || '';
                if (url.startsWith('/tabs/') && this.previousUrl.startsWith('/tabs/')) {
                    this.stateService.remove('GroupingsComponent');
                    this.stateService.remove('CiphersComponent');
                }
                if (url.startsWith('/tabs/')) {
                    this.stateService.remove('addEditCipher');
                }
                this.previousUrl = url;
            }
        });
    }

    getState(outlet: RouterOutlet) {
        return outlet.activatedRouteData.state;
    }

    private async recordActivity() {
        const now = (new Date()).getTime();
        if (this.lastActivity != null && now - this.lastActivity < 250) {
            return;
        }

        this.lastActivity = now;
        this.storageService.save(ConstantsService.lastActiveKey, now);
    }
}
