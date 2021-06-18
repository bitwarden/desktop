import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import Swal, { SweetAlertIcon } from 'sweetalert2/src/sweetalert2.js';

export async function _showDialog(msg: any, platformUtilsService: PlatformUtilsService) {
    let iconClasses: string = null;
    const type = msg.type;
    if (type != null) {
        // If you add custom types to this part, the type to SweetAlertIcon cast below needs to be changed.
        switch (type) {
            case 'success':
            iconClasses = 'fa-check text-success';
            break;
            case 'warning':
            iconClasses = 'fa-warning text-warning';
            break;
            case 'error':
            iconClasses = 'fa-bolt text-danger';
            break;
            case 'info':
            iconClasses = 'fa-info-circle text-info';
            break;
            default:
            break;
        }
    }

    const cancelText = msg.cancelText;
    const confirmText = msg.confirmText;
    const confirmed = await Swal.fire({
        heightAuto: false,
        buttonsStyling: false,
        icon: type as SweetAlertIcon, // required to be any of the SweetAlertIcons to output the iconHtml.
        iconHtml: iconClasses != null ? `<i class="swal-custom-icon fa ${iconClasses}"></i>` : undefined,
        text: msg.text,
        title: msg.title,
        showCancelButton: (cancelText != null),
        cancelButtonText: cancelText,
        showConfirmButton: true,
        confirmButtonText: confirmText == null ? this.i18nService.t('ok') : confirmText,
        timer: 300000,
    });
    platformUtilsService.resolveDialogPromise(msg.dialogId, confirmed.value);
}
