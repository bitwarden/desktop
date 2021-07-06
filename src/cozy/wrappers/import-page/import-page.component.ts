import { Component, ViewEncapsulation } from '@angular/core';
import CozyClient from 'cozy-client';
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
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CozyClientService } from '../../services/cozy-client.service';
import { AngularWrapperComponent } from '../angular-wrapper.component';
// @ts-ignore
import ImportPage from './import-page.jsx';

interface ImportPageProps {
    client: CozyClient;
    bitwardenData: {
        extension_installed: boolean;
    };
    vaultData: any;
}

@Component({
    selector: 'app-import-page',
    templateUrl: '../angular-wrapper.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ImportPageComponent extends AngularWrapperComponent {
    constructor(
        private apiService: ApiService,
        private environmentService: EnvironmentService,
        private authService: AuthService,
        private syncService: SyncService,
        private cryptoService: CryptoService,
        private cipherService: CipherService,
        private userService: UserService,
        private collectionService: CollectionService,
        private passwordGenerationService: PasswordGenerationService,
        private vaultTimeoutService: VaultTimeoutService,
        protected clientService: CozyClientService,
        private folderService: FolderService,
        private i18nService: I18nService,
        private platformUtilsService: PlatformUtilsService

    ) {
        super(clientService);
    }

    /******************/
    /* Props Bindings */
    /******************/

    protected getProps(): ImportPageProps {
        const data = {
            extension_installed: true, // to be replaced with client fetch
        };

        const client = this.clientService.GetClient();

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

        return {
            client: client,
            bitwardenData: data,
            vaultData: vaultData,
        };
    }

    /**********/
    /* Render */
    /**********/

    protected renderReact() {
        ReactDOM.render(
            React.createElement(ImportPage, this.getProps()),
            this.getRootDomNode()
        );
    }
}
