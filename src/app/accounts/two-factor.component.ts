import * as template from './two-factor.component.html';

import {
    Component,
    ComponentFactoryResolver,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ModalComponent } from '../modal.component';

import { TwoFactorOptionsComponent } from './two-factor-options.component';

import { TwoFactorProviderType } from 'jslib/enums/twoFactorProviderType';

import { TwoFactorEmailRequest } from 'jslib/models/request/twoFactorEmailRequest';

import { ApiService } from 'jslib/abstractions/api.service';
import { AuthService } from 'jslib/abstractions/auth.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SyncService } from 'jslib/abstractions/sync.service';

import { TwoFactorProviders } from 'jslib/services/auth.service';

@Component({
    selector: 'app-two-factor',
    template: template,
})
export class TwoFactorComponent implements OnInit {
    @ViewChild('twoFactorOptions', { read: ViewContainerRef }) twoFactorOptionsModal: ViewContainerRef;

    token: string = '';
    remember: boolean = false;
    u2fReady: boolean = false;
    providers = TwoFactorProviders;
    providerType = TwoFactorProviderType;
    selectedProviderType: TwoFactorProviderType = TwoFactorProviderType.Authenticator;
    u2fSupported: boolean = false;
    u2f: any = null;
    title: string = '';
    twoFactorEmail: string = null;
    formPromise: Promise<any>;
    emailPromise: Promise<any>;

    constructor(private authService: AuthService, private router: Router, private analytics: Angulartics2,
        private toasterService: ToasterService, private i18nService: I18nService, private apiService: ApiService,
        private platformUtilsService: PlatformUtilsService,
        private componentFactoryResolver: ComponentFactoryResolver, private syncService: SyncService) {
        this.u2fSupported = this.platformUtilsService.supportsU2f(window);
    }

    async ngOnInit() {
        if (this.authService.email == null || this.authService.masterPasswordHash == null ||
            this.authService.twoFactorProviders == null) {
            this.router.navigate(['login']);
            return;
        }

        this.selectedProviderType = this.authService.getDefaultTwoFactorProvider(this.u2fSupported);
        await this.init();
    }

    async init() {
        if (this.selectedProviderType == null) {
            this.title = this.i18nService.t('loginUnavailable');
            return;
        }

        this.title = (TwoFactorProviders as any)[this.selectedProviderType].name;
        const params = this.authService.twoFactorProviders.get(this.selectedProviderType);
        switch (this.selectedProviderType) {
            case TwoFactorProviderType.U2f:
                if (!this.u2fSupported) {
                    break;
                }

                const challenges = JSON.parse(params.Challenges);
                // TODO: init u2f
                break;
            case TwoFactorProviderType.Duo:
            case TwoFactorProviderType.OrganizationDuo:
                setTimeout(() => {
                    (window as any).Duo.init({
                        host: params.Host,
                        sig_request: params.Signature,
                        submit_callback: async (f: HTMLFormElement) => {
                            const sig = f.querySelector('input[name="sig_response"]') as HTMLInputElement;
                            if (sig != null) {
                                this.token = sig.value;
                                await this.submit();
                            }
                        },
                    });
                });
                break;
            case TwoFactorProviderType.Email:
                this.twoFactorEmail = params.Email;
                if (this.authService.twoFactorProviders.size > 1) {
                    await this.sendEmail(false);
                }
                break;
            default:
                break;
        }
    }

    async submit() {
        if (this.token == null || this.token === '') {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('verificationCodeRequired'));
            return;
        }

        if (this.selectedProviderType === TwoFactorProviderType.U2f) {
            // TODO: stop U2f
        } else if (this.selectedProviderType === TwoFactorProviderType.Email ||
            this.selectedProviderType === TwoFactorProviderType.Authenticator) {
            this.token = this.token.replace(' ', '').trim();
        }

        try {
            this.formPromise = this.authService.logInTwoFactor(this.selectedProviderType, this.token, this.remember);
            await this.formPromise;
            this.syncService.fullSync(true);
            this.analytics.eventTrack.next({ action: 'Logged In From Two-step' });
            this.router.navigate(['vault']);
        } catch {
            if (this.selectedProviderType === TwoFactorProviderType.U2f) {
                // TODO: start U2F again
            }
        }
    }

    async sendEmail(doToast: boolean) {
        if (this.selectedProviderType !== TwoFactorProviderType.Email) {
            return;
        }

        if (this.emailPromise != null) {
            return;
        }

        try {
            const request = new TwoFactorEmailRequest(this.authService.email, this.authService.masterPasswordHash);
            this.emailPromise = this.apiService.postTwoFactorEmail(request);
            await this.emailPromise;
            if (doToast) {
                this.toasterService.popAsync('success', null,
                    this.i18nService.t('verificationCodeEmailSent', this.twoFactorEmail));
            }
        } catch { }

        this.emailPromise = null;
    }

    anotherMethod() {
        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        const modal = this.twoFactorOptionsModal.createComponent(factory).instance;
        const childComponent = modal.show<TwoFactorOptionsComponent>(TwoFactorOptionsComponent,
            this.twoFactorOptionsModal);

        childComponent.onProviderSelected.subscribe(async (provider: TwoFactorProviderType) => {
            modal.close();
            this.selectedProviderType = provider;
            await this.init();
        });
        childComponent.onRecoverSelected.subscribe(() => {
            modal.close();
        });
    }
}
