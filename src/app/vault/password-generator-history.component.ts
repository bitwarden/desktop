import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { Component } from '@angular/core';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import {
    PasswordGeneratorHistoryComponent as BasePasswordGeneratorHistoryComponent,
} from 'jslib/angular/components/password-generator-history.component';

@Component({
    selector: 'app-password-generator-history',
    templateUrl: 'password-generator-history.component.html',
})
export class PasswordGeneratorHistoryComponent extends BasePasswordGeneratorHistoryComponent {
    constructor(passwordGenerationService: PasswordGenerationService, analytics: Angulartics2,
        platformUtilsService: PlatformUtilsService, i18nService: I18nService,
        toasterService: ToasterService) {
        super(passwordGenerationService, analytics, platformUtilsService, i18nService, toasterService, window);
    }
}
