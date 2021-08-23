import { Component, Input, ViewEncapsulation } from '@angular/core';
import { OrganizationUserStatusType } from 'jslib/enums/organizationUserStatusType';
import { OrganizationUserType } from 'jslib/enums/organizationUserType';
import { Utils } from 'jslib/misc/utils';
import { OrganizationUserConfirmRequest } from 'jslib/models/request/organizationUserConfirmRequest';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AngularWrapperComponent, AngularWrapperProps } from '../angular-wrapper.component';
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
    getRecipientsToBeConfirmed: (organizationId: string) => User[];
    confirmRecipient: (organizationId: string) => Promise<void>;
    rejectRecipient: (organizationId: string) => Promise<void>;
}

interface SharingProps extends AngularWrapperProps {
    file: File;
    confirmationMethods: ConfirmationMethods;
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

    /******************/
    /* Props Bindings */
    /******************/

    protected async getProps(): Promise<SharingProps> {
        const collections = await this.collectionService.getAllDecrypted();

        const currentCollection = collections.find(collection => collection.id === this.collectionId);

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

    protected async loadOrganizationUsersToBeConfirmed(organizationId: string) {
        const organizationUsers = await this.apiService.getOrganizationUsers(organizationId);

        const currentUserId = await this.userService.getUserId();

        const isOwner = organizationUsers.data.find(user => {
            return user.type === OrganizationUserType.Owner
                && user.id === currentUserId;
        });

        if (!isOwner) {
            return [];
        }

        const invitedUsers = organizationUsers.data.filter(user => {
            return user.type === OrganizationUserType.User
                && user.status === OrganizationUserStatusType.Accepted
                && user.id !== currentUserId;
        });

        const finalUsers: User[] = [];
        for (const user of invitedUsers) {
            const publicKey = (await this.apiService.getUserPublicKey(user.id)).publicKey;

            const fingerprint = await this.cryptoService.getFingerprint(user.id, Utils.fromB64ToArray(publicKey).buffer);

            finalUsers.push({
                name: user.name,
                id: user.id,
                email: user.email,
                publicKey: publicKey,
                fingerprint: fingerprint,
                fingerprintPhrase: fingerprint.join('-'),
            });
        }

        return finalUsers;
    }

    protected async confirmUser(user: User) {
        const organizations = await this.userService.getAllOrganizations();

        const organizationsWithoutCozy = organizations.filter(organization => organization.name !== 'Cozy');

        for (const organization of organizationsWithoutCozy) {
            const organizationUsers = await this.apiService.getOrganizationUsers(organization.id);

            const userInOrganization = organizationUsers.data
                .filter(organizationUser => organizationUser.status === OrganizationUserStatusType.Accepted)
                .map(organizationUser => organizationUser.id)
                .includes(user.id);

            if (userInOrganization) {
                const orgKey = await this.cryptoService.getOrgKey(organization.id);
                const key = await this.cryptoService.rsaEncrypt(orgKey.key, Utils.fromB64ToArray(user.publicKey).buffer);
                const request = new OrganizationUserConfirmRequest();
                request.key = key.encryptedString;

                await this.apiService.postOrganizationUserConfirm(organization.id, user.id, request);
            }
        }
    }

    protected async rejectUser(user: User) {
        try {
            const client = this.clientService.GetClient();

            await client.stackClient.fetchJSON(
                'DELETE',
                `/bitwarden/contacts/${user.id}`,
                []
            );
        } catch {
            this.platformUtilsService.showToast('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('unexpectedError'));
        }
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
}
