import * as template from './password-generator.component.html';

import { Angulartics2 } from 'angulartics2';
import { ToasterService } from 'angular2-toaster';

import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { UtilsService } from 'jslib/abstractions/utils.service';

@Component({
    selector: 'password-generator',
    template: template,
})
export class PasswordGeneratorComponent implements OnInit {
    @Input() showSelect: boolean = false;
    @Output() onSelected = new EventEmitter<string>();

    options: any = {};
    password: string = '-';
    showOptions = false;

    constructor(private passwordGenerationService: PasswordGenerationService, private analytics: Angulartics2,
        private utilsService: UtilsService) { }

    async ngOnInit() {
        this.options = await this.passwordGenerationService.getOptions();
        this.password = this.passwordGenerationService.generatePassword(this.options);
        this.analytics.eventTrack.next({ action: 'Generated Password' });
        await this.passwordGenerationService.addHistory(this.password);

        const slider = document.querySelector('#lengthRange');
        if (slider) {
            // Save password once the slider stop moving.
            slider.addEventListener('change', async (e) => {
                e.preventDefault();
                this.saveOptions(false);
                await this.passwordGenerationService.addHistory(this.password);
                this.analytics.eventTrack.next({ action: 'Regenerated Password' });
            });
            // Regenerate while slider moving
            slider.addEventListener('input', (e) => {
                e.preventDefault();
                this.normalizeOptions();
                this.password = this.passwordGenerationService.generatePassword(this.options);
            });
        }
    }

    async saveOptions(regenerate: boolean = true) {
        this.normalizeOptions();
        await this.passwordGenerationService.saveOptions(this.options);

        if (regenerate) {
            this.password = this.passwordGenerationService.generatePassword(this.options);
            await this.passwordGenerationService.addHistory(this.password);
            this.analytics.eventTrack.next({ action: 'Regenerated Password' });
        }
    }

    regenerate() {
        this.password = this.passwordGenerationService.generatePassword(this.options);
        this.analytics.eventTrack.next({ action: 'Regenerated Password' });
    }

    copy() {
        this.analytics.eventTrack.next({ action: 'Copied Generated Password' });
        this.utilsService.copyToClipboard(this.password, window.document);
    }

    select() {
        this.analytics.eventTrack.next({ action: 'Selected Generated Password' });
        this.onSelected.emit(this.password);
    }

    toggleOptions() {
        this.showOptions = !this.showOptions;
    }

    private normalizeOptions() {
        if (!this.options.uppercase && !this.options.lowercase && !this.options.number && !this.options.special) {
            this.options.lowercase = true;
            const lowercase = document.querySelector('#lowercase') as HTMLInputElement;
            if (lowercase) {
                lowercase.checked = true;
            }
        }
        if (!this.options.minNumber) {
            this.options.minNumber = 0;
        }
        if (!this.options.minSpecial) {
            this.options.minSpecial = 0;
        }
        if (this.options.length > 128) {
            this.options.length = 128;
        }
    }
}
