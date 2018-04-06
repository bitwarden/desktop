import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { HintComponent as BaseHintComponent } from 'jslib/angular/components/hint.component';

@Component({
    selector: 'app-hint',
    templateUrl: 'hint.component.html',
})
export class HintComponent extends BaseHintComponent {
    constructor(router: Router, analytics: Angulartics2,
        toasterService: ToasterService, i18nService: I18nService,
        apiService: ApiService) {
        super(router, analytics, toasterService, i18nService, apiService);
    }
}
