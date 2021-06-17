import Swal from 'sweetalert2';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import {
    ElectronPlatformUtilsService as BaseElectronPlatformUtilsService
} from 'jslib-electron/services/electronPlatformUtils.service';

export class ElectronPlatformUtilsService extends BaseElectronPlatformUtilsService {

    constructor(i18nService: I18nService, messagingService: MessagingService,
        isDesktopApp: boolean, storageService: StorageService) {
        super(i18nService, messagingService, isDesktopApp, storageService);
    }

    async showPasswordDialog(title: string, body: string, passwordValidation: (value: string) => Promise<boolean>):
        Promise<boolean> {

        const html = `
        ${body}
        <div class="box password-reprompt">
            <div class="box-content">
                <div class="box-content-row box-content-row-flex">
                    <div class="row-main">
                        <label for="masterPassword">${this.i18nService.t('masterPass')}</label>
                        <input id="masterPassword" type="password" name="MasterPassword" class="monospaced" required>
                    </div>
                    <div class="action-buttons">
                        <a class="row-btn" href="#" id="toggleVisibility" role="button"
                            title="${this.i18nService.t('toggleVisibility')}">
                            <i class="fa fa-lg fa-eye" aria-hidden="true"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        `;

        let el: HTMLElement;
        let visible = false;

        const result = await Swal.fire({
            heightAuto: false,
            titleText: title,
            html: html,
            confirmButtonText: this.i18nService.t('ok'),
            showCancelButton: true,
            cancelButtonText: this.i18nService.t('cancel'),
            inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off',
            },
            preConfirm: async (): Promise<any> => {
                const input = el.querySelector('#masterPassword') as any;
                if (await passwordValidation(input.value)) {
                    return true;
                }

                return Swal.showValidationMessage(this.i18nService.t('invalidMasterPassword'));
            },
            didOpen: el2 => {
                el = el2;

                const input = (el.querySelector('#masterPassword') as HTMLInputElement);
                input.focus();
                input.onkeydown = (event: KeyboardEvent) => {
                    if (event.key === 'Enter') {
                        Swal.clickConfirm();
                    }
                };

                const icon = el.querySelector('#toggleVisibility i');
                (el.querySelector('#toggleVisibility') as HTMLElement).onclick = () => {
                    visible = !visible;
                    icon.classList.remove('fa-eye', 'fa-eye-slash');
                    icon.classList.add(visible ? 'fa-eye-slash' : 'fa-eye');
                    input.type = visible ? 'text' : 'password';
                };
            },
        });

        return result.isConfirmed;
    }
}
