import * as template from './password-generator.component.html';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import {
    ChangeDetectorRef,
    Component,
    NgZone,
} from '@angular/core';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import {
    PasswordGeneratorComponent as BasePasswordGeneratorComponent
} from 'jslib/angular/components/password-generator.component';

@Component({
    selector: 'app-password-generator',
    template: template,
})
export class PasswordGeneratorComponent extends BasePasswordGeneratorComponent {
    constructor(passwordGenerationService: PasswordGenerationService, analytics: Angulartics2,
        platformUtilsService: PlatformUtilsService, i18nService: I18nService,
        toasterService: ToasterService, ngZone: NgZone,
        changeDetectorRef: ChangeDetectorRef) {
        super(passwordGenerationService, analytics, platformUtilsService, i18nService,
            toasterService, ngZone, changeDetectorRef);
    }
}
