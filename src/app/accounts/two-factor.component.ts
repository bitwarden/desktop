import {
    Component,
    ComponentFactoryResolver,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { TwoFactorOptionsComponent } from './two-factor-options.component';

import { TwoFactorProviderType } from 'jslib/enums/twoFactorProviderType';

import { ApiService } from 'jslib/abstractions/api.service';
import { AuthService } from 'jslib/abstractions/auth.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { SyncService } from 'jslib/abstractions/sync.service';

import { ModalComponent } from 'jslib/angular/components/modal.component';
import { TwoFactorComponent as BaseTwoFactorComponent } from 'jslib/angular/components/two-factor.component';

@Component({
    selector: 'app-two-factor',
    templateUrl: 'two-factor.component.html',
})
export class TwoFactorComponent extends BaseTwoFactorComponent {
    @ViewChild('twoFactorOptions', { read: ViewContainerRef, static: true }) twoFactorOptionsModal: ViewContainerRef;

    showingModal = false;

    constructor(authService: AuthService, router: Router,
        i18nService: I18nService, apiService: ApiService,
        platformUtilsService: PlatformUtilsService, syncService: SyncService,
        environmentService: EnvironmentService, private componentFactoryResolver: ComponentFactoryResolver,
        stateService: StateService, storageService: StorageService, route: ActivatedRoute) {
        super(authService, router, i18nService, apiService, platformUtilsService, window, environmentService,
            stateService, storageService, route);
        super.onSuccessfulLogin = () => {
            return syncService.fullSync(true);
        };
    }

    anotherMethod() {
        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        const modal = this.twoFactorOptionsModal.createComponent(factory).instance;
        modal.onShown.subscribe(() => {
            this.showingModal = true;
        });
        modal.onClosed.subscribe(() => {
            this.showingModal = false;
            modal.onShown.unsubscribe();
            modal.onClosed.unsubscribe();
        });

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
