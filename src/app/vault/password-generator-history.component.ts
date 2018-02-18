import * as template from './password-generator-history.component.html';

import { Angulartics2 } from 'angulartics2';

import {
    Component,
    OnInit,
} from '@angular/core';

import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { PasswordHistory } from 'jslib/models/domain/passwordHistory';

@Component({
    selector: 'app-password-generator-history',
    template: template,
})
export class PasswordGeneratorHistoryComponent implements OnInit {
    history: PasswordHistory[];

    constructor(private passwordGenerationService: PasswordGenerationService, private analytics: Angulartics2,
        private platformUtilsService: PlatformUtilsService) { }

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
    }
}
