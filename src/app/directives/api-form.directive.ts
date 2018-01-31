import {
    Directive,
    ElementRef,
    Input,
    OnChanges,
} from '@angular/core';

import { ValidationService } from '../services/validation.service';

@Directive({
    selector: '[appApiForm]',
})
export class ApiFormDirective implements OnChanges {
    @Input() appApiForm: Promise<any>;

    constructor(private el: ElementRef, private validationService: ValidationService) { }

    ngOnChanges(changes: any) {
        if (this.appApiForm == null || this.appApiForm.then == null) {
            return;
        }

        this.el.nativeElement.loading = true;

        this.appApiForm.then((response: any) => {
            this.el.nativeElement.loading = false;
        }, (e: any) => {
            this.el.nativeElement.loading = false;
            this.validationService.showError(e);
        });
    }
}
