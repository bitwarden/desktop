import { Component, ViewEncapsulation } from '@angular/core';
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

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { CozyClientService } from '../../services/cozy-client.service';
import { SharingService, User } from '../../services/sharing.service';

// @ts-ignore
import ConfirmTrustedUsers from './confirm-trusted-users.jsx';

const BroadcasterSubscriptionId = 'ConfirmTrustedUsersComponent';

interface ConfirmationMethods {
    getRecipientsToBeConfirmed: (organizationId: string) => User[];
    confirmRecipient: (organizationId: string) => Promise<void>;
    rejectRecipient: (organizationId: string) => Promise<void>;
}

interface ConfirmTrustedUsersProps extends AngularWrapperProps {
    confirmationMethods: ConfirmationMethods;
    showModal: boolean;
    closeModal: () => {};
}

@Component({
    selector: 'app-confirm-trusted-users',
    templateUrl: '../angular-wrapper.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ConfirmTrustedUsersComponent extends AngularWrapperComponent {
    showModal = false;

    private waitForFirstSync = true;
    private usersToBeConfirmedCached: User[] = null;

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
        protected sharingService: SharingService,
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
            userService,
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
                case 'syncCompleted':
                    if (this.waitForFirstSync) {
                        this.waitForFirstSync = false;

                        this.showModal = true;
                        this.firstRenderReact();
                    }
                    break;
            }
        });
    }

    /******************/
    /* Props Bindings */
    /******************/

    protected async getProps(): Promise<ConfirmTrustedUsersProps> {
        const reactWrapperProps = await this.getReactWrapperProps();

        return {
            reactWrapperProps: reactWrapperProps,
            confirmationMethods: this.getTwoStepsConfirmationMethods(),
            showModal: this.showModal,
            closeModal: this.closeModal.bind(this),
        };
    }

    /**********/
    /* Render */
    /**********/

    protected async firstRenderReact() {
        this.usersToBeConfirmedCached = await this.sharingService.loadAllUsersToBeConfirmed();

        if (this.usersToBeConfirmedCached.length === 0) {
            return;
        }

        this.renderReact();
    }

    protected async renderReact() {
        ReactDOM.render(
            React.createElement(ConfirmTrustedUsers, await this.getProps()),
            this.getRootDomNode()
        );
    }

    /************************/
    /* Confirmation Methods */
    /************************/

    protected async loadUsersToBeConfirmed() {
        if (this.usersToBeConfirmedCached) {
            const result = this.usersToBeConfirmedCached;
            this.usersToBeConfirmedCached = null;

            return result;
        }

        const usersToBeConfirmed = await this.sharingService.loadAllUsersToBeConfirmed();

        if (usersToBeConfirmed.length === 0 && this.showModal === true) {
            this.closeModal();
        }

        return usersToBeConfirmed;
    }

    protected async confirmUser(user: User) {
        return await this.sharingService.confirmUser(user);
    }

    protected async rejectUser(user: User) {
        return await this.sharingService.rejectUser(user);
    }

    protected getTwoStepsConfirmationMethods(): ConfirmationMethods {
        const loadUsersToBeConfirmed = this.loadUsersToBeConfirmed.bind(this);
        const confirmUser = this.confirmUser.bind(this);
        const rejectUser = this.rejectUser.bind(this);

        return {
            getRecipientsToBeConfirmed: loadUsersToBeConfirmed,
            confirmRecipient: confirmUser,
            rejectRecipient: rejectUser,
        };
    }

    /***************/
    /* Modal state */
    /***************/

    protected closeModal() {
        this.showModal = false;
        this.renderReact();
    }
}
