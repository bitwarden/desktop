import { ApiService } from 'jslib/abstractions/api.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PolicyService } from 'jslib/abstractions/policy.service';
import { SendService } from 'jslib/abstractions/send.service';
import { SettingsService } from 'jslib/abstractions/settings.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { SyncCipherNotification } from 'jslib/models/response/notificationResponse';
import { ProfileOrganizationResponse } from 'jslib/models/response/profileOrganizationResponse';
import { SyncService as SyncServiceBase } from 'jslib/services/sync.service';
import { CryptoService } from './crypto.service';
import { UserService } from './user.service';

import { CozyClientService } from '../cozy/services/cozy-client.service';

const Keys = {
    lastSyncPrefix: 'lastSync_',
};

interface Member {
    user_id: string;
    key?: string;
}

type Members = { [id: string]: Member };

interface CozyOrganizationDocument {
    members?: Members;
}

export class SyncService extends SyncServiceBase {
    syncInProgress: boolean = false;

    private localCollectionService: CollectionService;
    private localApiService: ApiService;
    private localUserService: UserService;
    private localMessagingService: MessagingService;
    private localCryptoService: CryptoService;
    private localStorageService: StorageService;

    constructor(userService: UserService, apiService: ApiService,
        settingsService: SettingsService, folderService: FolderService,
        cipherService: CipherService, cryptoService: CryptoService,
        collectionService: CollectionService, storageService: StorageService,
        messagingService: MessagingService, policyService: PolicyService,
        sendService: SendService, logoutCallback: (expired: boolean) => Promise<void>,
        private tokenService: TokenService, private clientService: CozyClientService) {
          super(userService, apiService,
            settingsService, folderService,
            cipherService, cryptoService,
            collectionService, storageService,
            messagingService, policyService,
            sendService, logoutCallback);

          this.localCollectionService = collectionService;
          this.localApiService = apiService;
          this.localUserService = userService;
          this.localMessagingService = messagingService;
          this.localCryptoService = cryptoService;
          this.localStorageService = storageService;
    }

    /**
     * Cozy stack may change how userId is computed in the future
     * So this userId can be desynchronized between client and server
     * This impacts realtime notifications that would be broken if wrong userId is used
     * This method allows to synchronize user identity from the server
     */
    async refreshIdentityToken() {
        const isAuthenticated = await this.localUserService.isAuthenticated();
        if (!isAuthenticated) {
            return;
        }

        const currentUserId = this.tokenService.getUserId();

        await this.localApiService.refreshIdentityToken();
        const refreshedUserId = this.tokenService.getUserId();

        if (currentUserId !== refreshedUserId) {
            const email = this.tokenService.getEmail();
            const kdf = await this.localUserService.getKdf();
            const kdfIterations = await this.localUserService.getKdfIterations();

            await this.localUserService.setInformation(refreshedUserId, email, kdf, kdfIterations);
        }
    }

    async fullSync(forceSync: boolean, allowThrowOnError = false): Promise<boolean> {
        await this.refreshIdentityToken();
        return await super.fullSync(forceSync, allowThrowOnError);
    }

    async syncUpsertCipher(notification: SyncCipherNotification, isEdit: boolean): Promise<boolean> {
        const isAuthenticated = await this.localUserService.isAuthenticated();
        if (!isAuthenticated) return false;

        this.localSyncStarted();
        try {
            await this.upsertOrganization(notification.organizationId, isEdit);

            return super.syncUpsertCipher(notification, isEdit);
        } catch (e) {
            return this.localSyncCompleted(false);
        }
    }

    async syncUpsertOrganization(organizationId: string, isEdit: boolean) {
        this.localSyncStarted();
        if (await this.localUserService.isAuthenticated()) {
            await this.upsertOrganization(organizationId, isEdit);

            return this.localSyncCompleted(true);
        }
        return this.localSyncCompleted(false);
    }

    async syncDeleteOrganization(organizationId: string): Promise<boolean> {
        this.localSyncStarted();
        if (await this.localUserService.isAuthenticated()) {
            const allCollections = await this.localCollectionService.getAll();

            const collectionsToDelete = allCollections
                .filter(collection => collection.organizationId === organizationId);

            for (const collection of collectionsToDelete) {
                await this.localCollectionService.delete(collection.id);
            }

            await this.localUserService.deleteOrganization(organizationId);

            return this.localSyncCompleted(true);
        }
        return this.localSyncCompleted(false);
    }

    protected async getOrganizationKey(organizationId: string): Promise<string> {
        const client = this.clientService.GetClient();
        const remoteOrganizationData: CozyOrganizationDocument = await client.stackClient.fetchJSON(
            'GET',
            `/data/com.bitwarden.organizations/${organizationId}`,
            []
        );

        const userId = await this.localUserService.getUserId();

        const remoteOrganizationUser = Object.values(remoteOrganizationData.members)
            .find(member => member.user_id === userId);

        return remoteOrganizationUser?.key || '';
    }

    protected async syncUpsertOrganizationKey(organizationId: string) {
        const remoteOrganizationKey = await this.getOrganizationKey(organizationId);

        await this.localCryptoService.upsertOrganizationKey(organizationId, remoteOrganizationKey);
    }

    protected async upsertOrganization(organizationId: string, isEdit: boolean) {
        if (!organizationId) {
            return;
        }

        const storedOrganization = await this.localUserService.getOrganization(organizationId);
        const storedOrganizationkey = await this.localCryptoService.getOrgKey(organizationId);

        if (storedOrganization !== null && storedOrganizationkey != null) {
            return;
        }

        const remoteOrganization = await this.localApiService.getOrganization(organizationId);
        const remoteOrganizationResponse = (remoteOrganization as any).response;
        const remoteProfileOrganizationResponse = new ProfileOrganizationResponse(remoteOrganizationResponse);

        if (remoteOrganization !== null) {
            await this.localUserService.upsertOrganization(remoteProfileOrganizationResponse);

            await this.syncUpsertOrganizationKey(organizationId);

            await this.syncUpsertCollections(organizationId, isEdit);
        }
    }

    protected async syncUpsertCollections(organizationId: string, isEdit: boolean) {
        const syncCollections = await this.localApiService.getCollections(organizationId);

        await this.localCollectionService.upsert(syncCollections.data.map(col => {
            return {
                externalId: col.externalId,
                id: col.id,
                name: col.name,
                organizationId: col.organizationId,
                readOnly: false, // TODO: this should be set later
            };
        }));
    }

    protected localSyncStarted() {
        this.syncInProgress = true;
        this.localMessagingService.send('syncStarted');
    }

    protected localSyncCompleted(successfully: boolean): boolean {
        this.syncInProgress = false;
        this.localMessagingService.send('syncCompleted', { successfully: successfully });
        return successfully;
    }
}
