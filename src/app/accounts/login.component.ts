import * as template from './login.component.html';

import {
    Component,
    ComponentFactoryResolver,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ModalComponent } from '../modal.component';
import { EnvironmentComponent } from './environment.component';

import { AuthResult } from 'jslib/models/domain/authResult';

import { AuthService } from 'jslib/abstractions/auth.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { SyncService } from 'jslib/abstractions/sync.service';

@Component({
    selector: 'app-login',
    template: template,
})
export class LoginComponent {
    @ViewChild('environment', { read: ViewContainerRef }) environmentModal: ViewContainerRef;

    email: string = '';
    masterPassword: string = '';
    showPassword: boolean = false;
    formPromise: Promise<AuthResult>;

    constructor(private authService: AuthService, private router: Router, private analytics: Angulartics2,
        private toasterService: ToasterService, private i18nService: I18nService, private syncService: SyncService,
        private componentFactoryResolver: ComponentFactoryResolver) { }

    async submit() {
        if (this.email == null || this.email === '') {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('emailRequired'));
            return;
        }
        if (this.email.indexOf('@') === -1) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('invalidEmail'));
            return;
        }
        if (this.masterPassword == null || this.masterPassword === '') {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('masterPassRequired'));
            return;
        }

        try {
            this.formPromise = this.authService.logIn(this.email, this.masterPassword);
            const response = await this.formPromise;
            if (response.twoFactor) {
                this.analytics.eventTrack.next({ action: 'Logged In To Two-step' });
                this.router.navigate(['2fa']);
            } else {
                this.syncService.fullSync(true);
                this.analytics.eventTrack.next({ action: 'Logged In' });
                this.router.navigate(['vault']);
            }
        } catch { }
    }

    settings() {
        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        const modal = this.environmentModal.createComponent(factory).instance;
        const childComponent = modal.show<EnvironmentComponent>(EnvironmentComponent,
            this.environmentModal);

        childComponent.onSaved.subscribe(() => {
            modal.close();
        });
    }

    togglePassword() {
        this.analytics.eventTrack.next({ action: 'Toggled Master Password on Login' });
        this.showPassword = !this.showPassword;
        document.getElementById('masterPassword').focus();
    }
}
