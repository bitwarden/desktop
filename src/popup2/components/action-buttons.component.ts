import {
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { BrowserApi } from '../../browser/browserApi';

import { CipherType } from 'jslib/enums/cipherType';

import { CipherView } from 'jslib/models/view/cipherView';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { PopupUtilsService } from '../services/popup-utils.service';

@Component({
    selector: 'app-action-buttons',
    templateUrl: 'action-buttons.component.html',
})
export class ActionButtonsComponent {
    @Output() onView = new EventEmitter<CipherView>();
    @Input() cipher: CipherView;
    @Input() showView: boolean = false;

    cipherType = CipherType;

    constructor(private analytics: Angulartics2, private toasterService: ToasterService,
        private i18nService: I18nService, private platformUtilsService: PlatformUtilsService,
        private popupUtilsService: PopupUtilsService) { }

    launch() {
        if (this.cipher.type !== CipherType.Login || !this.cipher.login.canLaunch) {
            return;
        }

        this.analytics.eventTrack.next({ action: 'Launched URI From Listing' });
        BrowserApi.createNewTab(this.cipher.login.uri);
        if (this.popupUtilsService.inPopup(window)) {
            BrowserApi.closePopup(window);
        }
    }

    copy(value: string, typeI18nKey: string, aType: string) {
        if (value == null) {
            return;
        }

        this.analytics.eventTrack.next({ action: 'Copied ' + aType });
        this.platformUtilsService.copyToClipboard(value);
        this.toasterService.popAsync('info', null,
            this.i18nService.t('valueCopied', this.i18nService.t(typeI18nKey)));
    }

    view() {
        this.onView.emit(this.cipher);
    }
}
