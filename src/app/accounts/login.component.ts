import {
    Component,
    ComponentFactoryResolver,
    OnDestroy,
    NgZone,
    ViewChild,
    ViewContainerRef,
    ElementRef,
} from '@angular/core';

import { Router } from '@angular/router';

import { EnvironmentComponent } from './environment.component';

import { AuthService } from 'jslib/abstractions/auth.service';
import { CryptoFunctionService } from 'jslib/abstractions/cryptoFunction.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { SyncService } from 'jslib/abstractions/sync.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { LoginComponent as BaseLoginComponent } from 'jslib/angular/components/login.component';
import { ModalComponent } from 'jslib/angular/components/modal.component';

const BroadcasterSubscriptionId = 'LoginComponent';

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html',
})
export class LoginComponent extends BaseLoginComponent implements OnDestroy {
    @ViewChild('environment', { read: ViewContainerRef, static: true }) environmentModal: ViewContainerRef;
    @ViewChild('masterPwdContainer') masterPwdContainer: ElementRef ;

    showingModal = false;
    isInCozyApp: boolean = false;
    baseUrl: string;

    constructor(authService: AuthService, router: Router, i18nService: I18nService,
        syncService: SyncService, private componentFactoryResolver: ComponentFactoryResolver,
        platformUtilsService: PlatformUtilsService, stateService: StateService,
        environmentService: EnvironmentService, passwordGenerationService: PasswordGenerationService,
        cryptoFunctionService: CryptoFunctionService, storageService: StorageService,
        private broadcasterService: BroadcasterService, private ngZone: NgZone) {
        super(authService, router, platformUtilsService, i18nService, stateService, environmentService,
            passwordGenerationService, cryptoFunctionService, storageService);
        super.onSuccessfulLogin = () => {
            return syncService.fullSync(true);
        };
    }

    async ngOnInit() {
        // @override by Cozy
        // check if code is run into a Cozy app
        // if yes, retrive url and user email
        const cozyDataNode = document.getElementById('cozy-app');
        const cozyDomain = cozyDataNode ? cozyDataNode.dataset.cozyDomain : null;
        if (cozyDomain) {
            this.isInCozyApp = true;
            this.email = `me@${cozyDomain}`;
            this.baseUrl = `https://${cozyDomain}/`;
            this.environmentService.setUrls({
                base: this.baseUrl + 'bitwarden',
            });
        }
        // end Cozy override
        await super.ngOnInit();
        this.broadcasterService.subscribe(BroadcasterSubscriptionId, async (message: any) => {
            this.ngZone.run(() => {
                switch (message.command) {
                    case 'windowHidden':
                        this.onWindowHidden();
                        break;
                    default:
                }
            });
        });
    }

    ngAfterViewInit() {
        const inputContainerEl  = this.masterPwdContainer.nativeElement;
        const labelTxt = 'Mot de passe de votre Cozy';
        this._turnIntoMaterialInput(inputContainerEl, labelTxt);
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    settings() {
        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        const modal = this.environmentModal.createComponent(factory).instance;
        modal.onShown.subscribe(() => {
            this.showingModal = true;
        });
        modal.onClosed.subscribe(() => {
            this.showingModal = false;
            modal.onShown.unsubscribe();
            modal.onClosed.unsubscribe();
        });

        const childComponent = modal.show<EnvironmentComponent>(EnvironmentComponent,
            this.environmentModal);
        childComponent.onSaved.subscribe(() => {
            modal.close();
        });
    }

    onWindowHidden() {
        this.showPassword = false;
    }

    openHint() {
        window.open(this.baseUrl + 'auth/passphrase_reset');
    }

    /* --------------------------------------------------------------------- */
    // Prepare an input element to have a material UX
    _turnIntoMaterialInput(container: any, labelText: string) { // BJA : labelEL to be removed
        // const container = inputEl.closest('.material-input');
        const inputEl = container.querySelector('input');
        container.querySelectorAll('label').forEach((label: any) => {label.textContent = labelText; });
        container.addEventListener('click', () => {
            inputEl.focus();
        });
        let isFocusedOrFilled = false;
        const initialPlaceholder = inputEl.placeholder;
        // init input state
        if (inputEl.value) {
            container.classList.add('focused-or-filled');
            inputEl.placeholder = initialPlaceholder;
            isFocusedOrFilled = true;
        }
        inputEl.addEventListener('focus', () => {
            container.classList.add('focused-or-filled');
            setTimeout( () => {inputEl.placeholder = initialPlaceholder; }, 100);
            isFocusedOrFilled = true;
        });
        inputEl.addEventListener('blur', () => {
            // console.log('blur to transition a meterial UI Input');
            if (!inputEl.value) {
                container.classList.remove('focused-or-filled');
                inputEl.placeholder = '';
                isFocusedOrFilled = false;
            }
        });
        inputEl.addEventListener('input', () => {
            // console.log('input HEARD !!!');
            if (!isFocusedOrFilled && inputEl.value) {
                container.classList.add('focused-or-filled');
                inputEl.placeholder = initialPlaceholder;
                isFocusedOrFilled = true;
            }
        });
        const visibilityBtn = container.querySelector('.visibility-btn');
        if (!visibilityBtn) { return; }
        const that = this;
        visibilityBtn.addEventListener('click', () => {
            if (that.showPassword) {
                inputEl.type = 'password';
                visibilityBtn.firstElementChild.classList.replace('fa-eye-slash', 'fa-eye');
            } else {
                inputEl.type = 'text';
                visibilityBtn.firstElementChild.classList.replace('fa-eye', 'fa-eye-slash');
            }
            that.showPassword = !that.showPassword;
        });
    }

    /* --------------------------------------------------------------------- */
    // Hide the visibility of the password
    // function _hidePwdVisibility() {
    //     pwdInput.type = 'password'
    //     visiPwdBtn.firstElementChild.classList.replace('fa-eye-slash','fa-eye')
    //     isPwdHidden = true
    // }

    /* --------------------------------------------------------------------- */
    // unHide the visibility of the password
    // function _unHidePwdVisibility() {
    //     pwdInput.type = 'text'
    //     visiPwdBtn.firstElementChild.classList.replace('fa-eye','fa-eye-slash')
    //     isPwdHidden = false
    // }

}
