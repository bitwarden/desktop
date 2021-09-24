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
import { UserService } from 'jslib/abstractions/user.service';
import { VaultTimeoutService } from 'jslib/abstractions/vaultTimeout.service';

import { CozyClientService } from '../../services/cozy-client.service';
import { SharingService } from '../../services/sharing.service';

// @ts-ignore
import Sharing from './sharing.jsx';

type Doctype = 'com.bitwarden.organizations';

interface File {
    id: string;
    name: string;
    _type: Doctype;
    _id: string;
}

interface ConfirmationMethods {
    getRecipientsToBeConfirmed: () => User[];
    confirmRecipient: (user: User) => Promise<void>;
    rejectRecipient: (user: User) => Promise<void>;
}

interface OnSharedEventArgs {
    document: File;
    recipients: any[];
    readOnlyRecipients: any[];
}

type OnSharedEvent = (args: OnSharedEventArgs) => Promise<void>;

interface SharingProps extends AngularWrapperProps {
    file: File;
    confirmationMethods: ConfirmationMethods;
    onShared: OnSharedEvent;
}

interface User {
    name: string;
    id: string;
    email: string;
    publicKey: string;
    fingerprint: string[];
    fingerprintPhrase: string;
}

@Component({
    selector: 'app-sharing',
    templateUrl: '../angular-wrapper.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class SharingComponent extends AngularWrapperComponent {
    @Input() collectionId: string = null;
    private organizationId: string = null;

    constructor(
        clientService: CozyClientService,
        apiService: ApiService,
        environmentService: EnvironmentService,
        authService: AuthService,
        syncService: SyncService,
        cryptoService: CryptoService,
        cipherService: CipherService,
        userService: UserService,
        collectionService: CollectionService,
        passwordGenerationService: PasswordGenerationService,
        vaultTimeoutService: VaultTimeoutService,
        folderService: FolderService,
        i18nService: I18nService,
        platformUtilsService: PlatformUtilsService,
        protected sharingService: SharingService
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

    protected async getProps(): Promise<SharingProps> {
        const collections = await this.collectionService.getAllDecrypted();

        const currentCollection = collections.find(collection => collection.id === this.collectionId);

        this.organizationId = currentCollection.organizationId;

        const reactWrapperProps = await this.getReactWrapperProps();

        return {
            reactWrapperProps: reactWrapperProps,
            file: {
                id: currentCollection.organizationId,
                name: currentCollection.name,
                _type: 'com.bitwarden.organizations',
                _id: currentCollection.organizationId,
            },
            confirmationMethods: this.getTwoStepsConfirmationMethods(),
            onShared: this.onShared.bind(this),
        };
    }

    /**********/
    /* Render */
    /**********/

    protected async renderReact() {
        ReactDOM.render(
            React.createElement(Sharing, await this.getProps()),
            this.getRootDomNode()
        );
    }

    /************************/
    /* Confirmation Methods */
    /************************/

    protected async loadOrganizationUsersToBeConfirmed() {
        return await this.sharingService.loadOrganizationUsersToBeConfirmed(this.organizationId);
    }

    protected async confirmUser(user: User) {
        return await this.sharingService.confirmUser(user);
    }

    protected async rejectUser(user: User) {
        return await this.sharingService.rejectUser(user);
    }

    protected getTwoStepsConfirmationMethods(): ConfirmationMethods {
        const loadOrganizationUsersToBeConfirmed = this.loadOrganizationUsersToBeConfirmed.bind(this);
        const confirmUser = this.confirmUser.bind(this);
        const rejectUser = this.rejectUser.bind(this);

        return {
            getRecipientsToBeConfirmed: loadOrganizationUsersToBeConfirmed,
            confirmRecipient: confirmUser,
            rejectRecipient: rejectUser,
        };
    }

    /*********************/
    /* Sharing Listeners */
    /*********************/

    protected async onShared({
        document,
        recipients,
        readOnlyRecipients,
    }: OnSharedEventArgs) {
        const recipientsToConfirm = [...recipients, ...readOnlyRecipients];
        const organizationId = document.id;

        await this.sharingService.autoConfirmTrustedUsers(organizationId, recipientsToConfirm);
    }
}
