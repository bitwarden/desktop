import * as template from './password-generator-history.component.html';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import {
    Component,
    OnInit,
} from '@angular/core';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { PasswordHistory } from 'jslib/models/domain/passwordHistory';

@Component({
    selector: 'app-password-generator-history',
    template: template,
})
export class PasswordGeneratorHistoryComponent implements OnInit {
    history: PasswordHistory[] = [];

    constructor(private passwordGenerationService: PasswordGenerationService, private analytics: Angulartics2,
        private platformUtilsService: PlatformUtilsService, private i18nService: I18nService,
        private toasterService: ToasterService) { }

    async ngOnInit() {
        this.history = await this.passwordGenerationService.getHistory();
    }

    clear() {
        this.history = [];
        this.passwordGenerationService.clear();
    }

    copy(password: string) {
        this.analytics.eventTrack.next({ action: 'Copied Historical Password' });
        this.platformUtilsService.copyToClipboard(password);
        this.toasterService.popAsync('info', null, this.i18nService.t('valueCopied', this.i18nService.t('password')));
    }
}
