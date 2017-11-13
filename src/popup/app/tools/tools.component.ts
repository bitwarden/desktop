import * as template from './tools.component.html';

import { UtilsService } from '../../../services/abstractions/utils.service';

class ToolsController {
    showExport: boolean;
    i18n: any;

    constructor(private SweetAlert: any, private i18nService: any,
                private $analytics: any, private utilsService: UtilsService) {
        this.i18n = i18nService;
        this.showExport = !utilsService.isEdge();
    }

    launchWebVault(createOrg: any) {
        this.$analytics.eventTrack('Launch Web Vault' + (createOrg ? ' For Share' : ''));
        chrome.tabs.create({ url: 'https://vault.bitwarden.com/#/' + (createOrg ? '?org=free' : '') });
    }

    launchAndroid() {
        this.$analytics.eventTrack('Launch Android');
        chrome.tabs.create({ url: 'https://play.google.com/store/apps/details?id=com.x8bit.bitwarden' });
    }

    launchiOS() {
        this.$analytics.eventTrack('Launch iOS');
        chrome.tabs.create({
            url: 'https://itunes.apple.com/us/app/bitwarden-free-password-manager/' +
            'id1137397744?mt=8',
        });
    }

    launchImport() {
        this.SweetAlert.swal({
            title: this.i18nService.importItems,
            text: this.i18nService.importItemsConfirmation,
            showCancelButton: true,
            confirmButtonText: this.i18nService.yes,
            cancelButtonText: this.i18nService.cancel,
        }, (confirmed: boolean) => {
            if (confirmed) {
                this.$analytics.eventTrack('Launch Web Vault For Import');
                chrome.tabs.create({ url: 'https://help.bitwarden.com/article/import-data/' });
            }
        });
    }
}

export const ToolsComponent = {
    bindings: {},
    controller: ToolsController,
    template,
};
