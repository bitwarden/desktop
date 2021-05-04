import Swal from 'sweetalert2';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import {
    ElectronPlatformUtilsService as BaseElectronPlatformUtilsService
} from 'jslib/electron/services/electronPlatformUtils.service';

export class ElectronPlatformUtilsService extends BaseElectronPlatformUtilsService {

    constructor(i18nService: I18nService, messagingService: MessagingService,
        isDesktopApp: boolean, storageService: StorageService) {
        super(i18nService, messagingService, isDesktopApp, storageService);
    }

    async showPasswordDialog(title: string, body: string, passwordValidation: (value: string) => Promise<boolean>):
        Promise<boolean> {
        const result = await Swal.fire({
            heightAuto: false,
            title: title,
            input: 'password',
            text: body,
            confirmButtonText: this.i18nService.t('ok'),
            showCancelButton: true,
            cancelButtonText: this.i18nService.t('cancel'),
            inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off',
            },
            inputValidator: async (value: string): Promise<any> => {
                if (await passwordValidation(value)) {
                    return false;
                }

                return this.i18nService.t('invalidMasterPassword');
            },
        });

        return result.isConfirmed;
    }
}
