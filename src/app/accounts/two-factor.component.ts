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

import { TwoFactorProviderType } from 'jslib-common/enums/twoFactorProviderType';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { AuthService } from 'jslib-common/abstractions/auth.service';
import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';

import { ModalComponent } from 'jslib-angular/components/modal.component';
import { TwoFactorComponent as BaseTwoFactorComponent } from 'jslib-angular/components/two-factor.component';

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
