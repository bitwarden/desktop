import { ApiService } from 'jslib/abstractions/api.service';
import { AppIdService } from 'jslib/abstractions/appId.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { LogService } from 'jslib/abstractions/log.service';
import { SyncService } from '../services/sync.service';
import { UserService } from 'jslib/abstractions/user.service';
import { VaultTimeoutService } from 'jslib/abstractions/vaultTimeout.service';

import { CozyClientService } from '../cozy/services/cozy-client.service';

import { NotificationsService as NotificationsServiceBase } from 'jslib/services/notifications.service';

export class NotificationsService extends NotificationsServiceBase {
    constructor(userService: UserService, private localSyncService: SyncService,
        appIdService: AppIdService, apiService: ApiService,
        vaultTimeoutService: VaultTimeoutService,
        logoutCallback: () => Promise<void>, logService: LogService,
        private clientService: CozyClientService) {
            super(
                userService,
                localSyncService,
                appIdService,
                apiService,
                vaultTimeoutService,
                logoutCallback,
                logService
            );
    }

    async init(environmentService: EnvironmentService): Promise<void> {
        await super.init(environmentService);

        const realtime = this.clientService.GetRealtime();
        realtime.unsubscribeAll();

        const organizationDoctype = 'com.bitwarden.organizations';

        await realtime.subscribe('deleted', organizationDoctype, this.handleOrganizationDelete.bind(this));
        await realtime.subscribe('updated', organizationDoctype, this.handleOrganizationUpdate.bind(this));
        await realtime.subscribe('created', organizationDoctype, this.handleOrganizationCreate.bind(this));
    }

    async handleOrganizationDelete(organization: any) {
        await this.localSyncService.syncDeleteOrganization(organization._id);
    }

    async handleOrganizationCreate(organization: any) {
        await this.localSyncService.syncUpsertOrganization(organization._id, false);
    }

    async handleOrganizationUpdate(organization: any) {
        await this.localSyncService.syncUpsertOrganization(organization._id, false);
    }
}