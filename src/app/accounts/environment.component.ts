import * as template from './environment.component.html';

import { Component } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { EnvironmentComponent as BaseEnvironmentComponent } from 'jslib/angular/components/environment.component';

@Component({
    selector: 'app-environment',
    template: template,
})
export class EnvironmentComponent extends BaseEnvironmentComponent {
    constructor(analytics: Angulartics2, toasterService: ToasterService,
        environmentService: EnvironmentService, i18nService: I18nService) {
        super(analytics, toasterService, environmentService, i18nService);
    }
}
