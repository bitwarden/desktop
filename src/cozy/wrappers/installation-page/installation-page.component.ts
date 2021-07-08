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
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MessagingService } from '../../../../jslib/src/abstractions/messaging.service';
import { CozyClientService } from '../../services/cozy-client.service';
import { VaultInstallationService } from '../../services/installation-guard.service';
import { AngularWrapperComponent } from '../angular-wrapper.component';
// @ts-ignore
import InstallationPage from './installation-page.jsx';


interface InstallationPageProps {
    client: CozyClient;
    bitwardenData: {
        extension_installed: boolean;
    };
    onSkipExtension: () => void;
    vaultData: any;
}

@Component({
    selector: 'app-installation-page',
    templateUrl: '../angular-wrapper.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class InstallationPageComponent extends AngularWrapperComponent {
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
        protected platformUtilsService: PlatformUtilsService,
        private vaultInstallationService: VaultInstallationService,
        private messagingService: MessagingService
    ) {
        super(
            clientService,
            apiService,
            environmentService,
            authService,
            syncService,
            cryptoService,
            cipherService,
            userService,
            collectionService,
            passwordGenerationService,
            vaultTimeoutService,
            folderService,
            i18nService,
            platformUtilsService
        );
    }
    /******************/
    /* Props Bindings */
    /******************/

    protected async fetchHintExists(client: CozyClient) {
        try {
            await client
                .getStackClient()
                .collection('io.cozy.settings')
                .get('hint');

            return true;
        } catch (e) {
            return false;
        }
    }

    protected onSkipExtension() {
        this.vaultInstallationService.setIsInstalled();
        this.messagingService.send('installed');
    }

    protected async getProps(): Promise<InstallationPageProps> {
        const client = this.clientService.GetClient();

        const hasHint = await this.fetchHintExists(client);

        const bitwardenData = {
            extension_installed: hasHint,
        };

        return {
            client: client,
            bitwardenData: bitwardenData,
            onSkipExtension: this.onSkipExtension.bind(this),
            vaultData: this.getVaultData(),
        };
    }

    /**********/
    /* Render */
    /**********/

    protected async renderReact() {
        ReactDOM.render(
            React.createElement(InstallationPage, await this.getProps()),
            this.getRootDomNode()
        );
    }
}
