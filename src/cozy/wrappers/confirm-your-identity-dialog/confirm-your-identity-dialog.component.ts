import { Component, Input, ViewEncapsulation } from '@angular/core';
import { OrganizationUserStatusType } from 'jslib/enums/organizationUserStatusType';
import { OrganizationUserType } from 'jslib/enums/organizationUserType';
import { Utils } from 'jslib/misc/utils';
import { OrganizationUserConfirmRequest } from 'jslib/models/request/organizationUserConfirmRequest';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AngularWrapperComponent, AngularWrapperProps } from '../angular-wrapper.component';

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
import { VaultTimeoutService } from 'jslib/abstractions/vaultTimeout.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { UserService } from '../../../services/user.service';
import { CozyClientService } from '../../services/cozy-client.service';

// @ts-ignore
import ConfirmYourIdentity from './confirm-your-identity-dialog.jsx';

const BroadcasterSubscriptionId = 'ConfirmYourIdentityComponent';

interface ConfirmYourIdentityProps extends AngularWrapperProps {
    ownerName: string;
    fingerprintPhrase: string;
    showModal: boolean;
    closeModal: () => {};
}

@Component({
    selector: 'app-confirm-your-identity-dialog',
    templateUrl: '../angular-wrapper.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ConfirmYourIdentityComponent extends AngularWrapperComponent {
    showModal = false;
    private organizationId: string = null;

    constructor(
        clientService: CozyClientService,
        apiService: ApiService,
        environmentService: EnvironmentService,
        authService: AuthService,
        syncService: SyncService,
        cryptoService: CryptoService,
        cipherService: CipherService,
        protected localUserService: UserService,
        collectionService: CollectionService,
        passwordGenerationService: PasswordGenerationService,
        vaultTimeoutService: VaultTimeoutService,
        folderService: FolderService,
        i18nService: I18nService,
        platformUtilsService: PlatformUtilsService,
        protected broadcasterService: BroadcasterService
    ) {
        super(
            clientService,
            apiService,
            environmentService,
            authService,
            syncService,
            cryptoService,
            cipherService,
            localUserService,
            collectionService,
            passwordGenerationService,
            vaultTimeoutService,
            folderService,
            i18nService,
            platformUtilsService
        );
    }

    ngOnInit() {
        super.ngOnInit();

        this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
            switch (message.command) {
                case 'showConfirmYourIdentityDialog':
                    this.organizationId = message.organizationId;
                    this.showModal = true;
                    this.renderReact();
                    break;
            }
        });
    }

    /******************/
    /* Props Bindings */
    /******************/

    protected async getProps(): Promise<ConfirmYourIdentityProps> {
        const reactWrapperProps = await this.getReactWrapperProps();

        const userId = await this.userService.getUserId();
        const fingerprint = await this.cryptoService.getFingerprint(userId);

        const owner = await this.localUserService.getOrganizationOwner(this.organizationId);

        return {
            reactWrapperProps: reactWrapperProps,
            ownerName: owner.name,
            fingerprintPhrase: fingerprint.join('-'),
            showModal: this.showModal,
            closeModal: this.closeModal.bind(this),
        };
    }

    /**********/
    /* Render */
    /**********/

    protected async renderReact() {
        if (this.organizationId) {
            ReactDOM.render(
                React.createElement(ConfirmYourIdentity, await this.getProps()),
                this.getRootDomNode()
            );
        }
    }

    /***************/
    /* Modal state */
    /***************/

    protected closeModal() {
        this.showModal = false;
        this.renderReact();
    }
}
