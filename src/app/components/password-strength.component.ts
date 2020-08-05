import {
    Component,
    Input,
    OnChanges,
} from '@angular/core';

import { I18nService } from 'jslib/abstractions/i18n.service';

@Component({
    selector: 'app-password-strength',
    templateUrl: 'password-strength.component.html',
})
export class PasswordStrengthComponent implements OnChanges {
    @Input() score?: number;
    @Input() showText = false;

    scoreWidth = 0;
    color = 'bg-danger';
    text: string;

    constructor(private i18nService: I18nService) { }

    ngOnChanges(): void {
        this.scoreWidth = this.score == null ? 0 : (this.score + 1) * 20;
        switch (this.score) {
            case 4:
                this.color = 'bg-success';
                this.text = this.i18nService.t('strong');
                break;
            case 3:
                this.color = 'bg-primary';
                this.text = this.i18nService.t('good');
                break;
            case 2:
                this.color = 'bg-warning';
                this.text = this.i18nService.t('weak');
                break;
            default:
                this.color = 'bg-danger';
                this.text = this.score != null ? this.i18nService.t('weak') : null;
                break;
        }
    }
}
