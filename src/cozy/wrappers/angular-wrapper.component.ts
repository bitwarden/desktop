import {
    AfterViewInit,
    Component,
    OnChanges,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import CozyClient from 'cozy-client';
import * as invariant from 'invariant';
import { ApiService } from 'jslib/abstractions/api.service';
import { AuthService } from 'jslib/abstractions/auth.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SyncService } from 'jslib/abstractions/sync.service';
import { UserService } from 'jslib/abstractions/user.service';
import { VaultTimeoutService } from 'jslib/abstractions/vaultTimeout.service';
import { Utils } from 'jslib/misc/utils';
import { ContainerService } from 'jslib/services/container.service';
import { ImportService } from 'jslib/services/import.service';
import * as uuid from 'uuid';
import { CozyClientService } from '../services/cozy-client.service';

export interface AngularWrapperProps {
    client: CozyClient;
    bitwardenData: {
        extension_installed: boolean;
    };
    vaultData: any;
}

@Component({
    templateUrl: './angular-wrapper.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class AngularWrapperComponent
    implements OnChanges, OnDestroy, OnInit, AfterViewInit
{
    rootDomID: string = '';

    constructor(
        protected clientService: CozyClientService,
        protected apiService: ApiService,
        protected environmentService: EnvironmentService,
        protected authService: AuthService,
        protected syncService: SyncService,
        protected cryptoService: CryptoService,
        protected cipherService: CipherService,
        protected userService: UserService,
        protected collectionService: CollectionService,
        protected passwordGenerationService: PasswordGenerationService,
        protected vaultTimeoutService: VaultTimeoutService,
        protected folderService: FolderService,
        protected i18nService: I18nService,
        protected platformUtilsService: PlatformUtilsService
    ) {}

    getVaultData() {
        const importService = new ImportService(
            this.cipherService,
            this.folderService,
            this.apiService,
            this.i18nService,
            this.collectionService,
            this.platformUtilsService,
            this.cryptoService
        );

        const containerService = new ContainerService(this.cryptoService);

        const vaultData = {
            apiService: this.apiService,
            environmentService: this.environmentService,
            authService: this.authService,
            syncService: this.syncService,
            cryptoService: this.cryptoService,
            cipherService: this.cipherService,
            userService: this.userService,
            collectionService: this.collectionService,
            passwordGenerationService: this.passwordGenerationService,
            containerService: containerService,
            vaultTimeoutService: this.vaultTimeoutService,
            importService: importService,
            utils: Utils,
        };

        return vaultData;
    }

    /*************/
    /* Lifecycle */
    /*************/

    ngOnInit() {
        this.rootDomID = uuid.v1();
    }

    ngOnChanges() {
        this.renderReactIfMounted();
    }

    ngAfterViewInit() {
        this.renderReactIfMounted();
    }

    ngOnDestroy() {
        // Uncomment if Angular 4 issue that ngOnDestroy is called AFTER DOM node removal is resolved
        // ReactDOM.unmountComponentAtNode(this.getRootDomNode())
    }

    /**********/
    /* Render */
    /**********/

    protected getRootDomNode() {
        const node = document.getElementById(this.rootDomID);
        invariant(node, `Node '${this.rootDomID} not found!`);
        return node;
    }

    protected renderReact() {
        throw new Error('should be overridden');
    }

    protected renderReactIfMounted() {
        if (this.isMounted()) {
            this.renderReact();
        }
    }

    private isMounted(): boolean {
        return !!this.rootDomID;
    }
}
