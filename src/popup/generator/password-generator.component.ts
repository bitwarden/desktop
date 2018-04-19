import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';

import { CipherView } from 'jslib/models/view/cipherView';

import {
    PasswordGeneratorComponent as BasePasswordGeneratorComponent,
} from 'jslib/angular/components/password-generator.component';

@Component({
    selector: 'app-password-generator',
    templateUrl: 'password-generator.component.html',
})
export class PasswordGeneratorComponent extends BasePasswordGeneratorComponent {
    private cipherState: CipherView;

    constructor(passwordGenerationService: PasswordGenerationService, analytics: Angulartics2,
        platformUtilsService: PlatformUtilsService, i18nService: I18nService,
        toasterService: ToasterService, private stateService: StateService,
        private router: Router, private location: Location) {
        super(passwordGenerationService, analytics, platformUtilsService, i18nService, toasterService, window);
    }

    async ngOnInit() {
        await super.ngOnInit();
        this.cipherState = await this.stateService.get<CipherView>('addEditCipher');
        this.showSelect = this.cipherState != null;
    }

    select() {
        super.select();
        this.cipherState.login.password = this.password;
        this.close();
    }

    close() {
        this.location.back();
    }
}
