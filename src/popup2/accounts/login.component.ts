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

    constructor(private router: Router, private analytics: Angulartics2,
        private toasterService: ToasterService) { }

    async submit() {
        
    }

    togglePassword() {
        this.analytics.eventTrack.next({ action: 'Toggled Master Password on Login' });
        this.showPassword = !this.showPassword;
        document.getElementById('masterPassword').focus();
    }
}
