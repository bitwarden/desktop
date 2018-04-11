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
    selector: 'app-ciphers-list',
    templateUrl: 'ciphers-list.component.html',
})
export class CiphersListComponent {
    @Output() onSelected = new EventEmitter<CipherView>();
    @Output() onView = new EventEmitter<CipherView>();
    @Input() ciphers: CipherView[];
    @Input() showView = false;
    @Input() title: string;

    cipherType = CipherType;

    constructor() { }

    selectCipher(c: CipherView) {
        this.onSelected.emit(c);
    }

    viewCipher(c: CipherView) {
        this.onView.emit(c);
    }
}
