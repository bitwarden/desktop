import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { HintComponent as BaseHintComponent } from 'jslib/angular/components/hint.component';

@Component({
    selector: 'app-hint',
    templateUrl: 'hint.component.html',
})
export class HintComponent extends BaseHintComponent {
    constructor(router: Router, platformUtilsService: PlatformUtilsService,
        i18nService: I18nService, apiService: ApiService) {
        super(router, i18nService, apiService, platformUtilsService);
    }
}
