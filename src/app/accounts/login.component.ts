import {
    Component,
    ComponentFactoryResolver,
    ElementRef,
    NgZone,
    OnDestroy,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

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

import { AuthResult } from 'jslib/models/domain/authResult';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { LoginComponent as BaseLoginComponent } from 'jslib/angular/components/login.component';
import { ModalComponent } from 'jslib/angular/components/modal.component';

import { CozyClientInstanceOption } from '../../cozy/CozyClientTypes';
import { CozyClientService } from '../../cozy/services/cozy-client.service';

import { ConstantsService } from 'jslib/services/constants.service';
import { Subscription } from 'rxjs/internal/Subscription';

const BroadcasterSubscriptionId = 'LoginComponent';

const Keys = {
    rememberedEmail: 'rememberedEmail',
    rememberEmail: 'rememberEmail',
};

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html',
})
export class LoginComponent extends BaseLoginComponent implements OnDestroy {
    @ViewChild('environment', { read: ViewContainerRef, static: true }) environmentModal: ViewContainerRef;
    @ViewChild('masterPwdContainer') masterPwdContainer: ElementRef ;

    localFormPromise: Promise<void | AuthResult>;

    showingModal = false;
    isInCozyApp: boolean = false;
    baseUrl: string;
    canAuthWithOIDC = false;
    appIconForOIDC = 'images/icons-login.svg';
    // Cozy customization, display error message on form
    // /*
    errorMsg = '';
    // */
    protected queryParamsSub: Subscription = undefined;
    protected redirectUri: string;

    constructor(authService: AuthService, router: Router, i18nService: I18nService,
        syncService: SyncService, private componentFactoryResolver: ComponentFactoryResolver,
        platformUtilsService: PlatformUtilsService, stateService: StateService,
        environmentService: EnvironmentService, passwordGenerationService: PasswordGenerationService,
        cryptoFunctionService: CryptoFunctionService, protected localStorageService: StorageService,
        private broadcasterService: BroadcasterService, private ngZone: NgZone, private clientService: CozyClientService,
        protected route: ActivatedRoute) {
        super(authService, router, platformUtilsService, i18nService, stateService, environmentService,
            passwordGenerationService, cryptoFunctionService, localStorageService);
        super.onSuccessfulLogin = () => {
            return syncService.fullSync(true);
        };
    }

    async ngOnInit() {
        // @override by Cozy
        // check if code is run into a Cozy app
        // if yes, retrieve url and user email from the htlm
        const { domain: cozyDomain } = (this.clientService.GetClient().getInstanceOptions() as CozyClientInstanceOption);
        const domainWithoutPort = cozyDomain && cozyDomain.split(':')[0];

        if (cozyDomain) {
            this.isInCozyApp = true;
            this.email = `me@${domainWithoutPort}`;
            const protocol = window.location ? window.location.protocol : 'https:';
            this.baseUrl =  `${protocol}//${cozyDomain}/`;
            this.environmentService.setUrls({
                base: this.baseUrl + 'bitwarden',
            });
        }
        await this.checkIfClientCanAuthWithOIDC();
        // TODO BJA const cozyToken = cozyDataNode ? cozyDataNode.dataset.cozytoken : null;
        // if (cozyToken) {
        //     await this.storageService.save('accessToken', cozyToken);
        // }

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

        this.queryParamsSub = this.route.queryParams.subscribe(async qParams => {
            if (qParams.redirectUri != null) {
                this.redirectUri = qParams.redirectUri;

                this.successRoute = this.redirectUri;
            }
        });
    }

    async checkIfClientCanAuthWithOIDC() {
        this.canAuthWithOIDC = this.clientService.GetClient().capabilities?.can_auth_with_oidc;
    }

    ngAfterViewInit() {
        const inputContainerEl  = this.masterPwdContainer.nativeElement;
        const labelTxt = this.canAuthWithOIDC ? this.i18nService.t('masterPass-oidc') : this.i18nService.t('masterPass');
        this._turnIntoMaterialInput(inputContainerEl, labelTxt);
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);

        this.queryParamsSub?.unsubscribe();
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

    /**
     * This is an override of base login component
     * It is needed to handle redirect uri if provided
     */
    async submit() {
        // Cozy customization, display error message on form
        // /*
        this.errorMsg = '';
        // */

        if (this.email == null || this.email === '') {
            // Cozy customization, display error message on form
            /*
            this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('emailRequired'));
            /*/
            this.errorMsg = this.i18nService.t('emailRequired');
            // */
            return;
        }
        if (this.email.indexOf('@') === -1) {
            // Cozy customization, display error message on form
            /*
            this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('invalidEmail'));
            /*/
            this.errorMsg = this.i18nService.t('invalidEmail');
            // */
            return;
        }
        if (this.masterPassword == null || this.masterPassword === '') {
            // Cozy customization, display error message on form
            /*
            this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('masterPassRequired'));
            /*/
            this.errorMsg = this.i18nService.t('masterPassRequired');
            // */
            return;
        }

        try {
            // Cozy customization, display error message on form
            /*
            this.formPromise = this.authService.logIn(this.email, this.masterPassword);
            const response = await this.formPromise;
            /*/
            this.localFormPromise = this.authService.logIn(this.email, this.masterPassword)
                .catch(e => {
                    if (e.statusCode === 401) {
                        this.errorMsg = this.i18nService.t('invalidMasterPassword');
                        return;
                    } else {
                        // unexpected messages are still displayed in toast as we cant control their length
                        throw e;
                    }
                });
            const response = await this.localFormPromise;

            if (!response) {
                return;
            }
            // */

            await this.localStorageService.save(Keys.rememberEmail, this.rememberEmail);
            if (this.rememberEmail) {
                await this.localStorageService.save(Keys.rememberedEmail, this.email);
            } else {
                await this.localStorageService.remove(Keys.rememberedEmail);
            }
            if (response.twoFactor) {
                if (this.onSuccessfulLoginTwoFactorNavigate != null) {
                    this.onSuccessfulLoginTwoFactorNavigate();
                } else {
                    this.router.navigate([this.twoFactorRoute]);
                }
            } else {
                const disableFavicon = await this.localStorageService.get<boolean>(ConstantsService.disableFaviconKey);
                await this.stateService.save(ConstantsService.disableFaviconKey, !!disableFavicon);
                if (this.onSuccessfulLogin != null) {
                    this.onSuccessfulLogin();
                }
                if (this.onSuccessfulLoginNavigate != null) {
                    this.onSuccessfulLoginNavigate();
                } else {
                    // @override by Cozy
                    this.router.navigateByUrl(this.successRoute);
                    // end Cozy override
                }
            }
        } catch { }
    }
}
