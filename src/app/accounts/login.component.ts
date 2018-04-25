import {
    Component,
    ComponentFactoryResolver,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { EnvironmentComponent } from './environment.component';

import { AuthService } from 'jslib/abstractions/auth.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { SyncService } from 'jslib/abstractions/sync.service';

import { LoginComponent as BaseLoginComponent } from 'jslib/angular/components/login.component';
import { ModalComponent } from 'jslib/angular/components/modal.component';

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html',
})
export class LoginComponent extends BaseLoginComponent {
    @ViewChild('environment', { read: ViewContainerRef }) environmentModal: ViewContainerRef;

    constructor(authService: AuthService, router: Router,
        analytics: Angulartics2, toasterService: ToasterService,
        i18nService: I18nService, syncService: SyncService,
        private componentFactoryResolver: ComponentFactoryResolver) {
        super(authService, router, analytics, toasterService, i18nService, syncService);
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
}
