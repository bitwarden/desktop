import {
    ChangeDetectorRef,
    Component,
    NgZone,
} from '@angular/core';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import {
    PasswordGeneratorComponent as BasePasswordGeneratorComponent,
} from 'jslib/angular/components/password-generator.component';

@Component({
    selector: 'app-password-generator',
    templateUrl: 'password-generator.component.html',
})
export class PasswordGeneratorComponent extends BasePasswordGeneratorComponent {
    constructor(passwordGenerationService: PasswordGenerationService, platformUtilsService: PlatformUtilsService,
        i18nService: I18nService, private ngZone: NgZone, private changeDetectorRef: ChangeDetectorRef) {
        super(passwordGenerationService, platformUtilsService, i18nService, window);
    }

    async saveOptions() {
        this.ngZone.run(async () => {
            await super.saveOptions();
            this.changeDetectorRef.detectChanges();
        });
    }
}
