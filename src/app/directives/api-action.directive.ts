import {
    Directive,
    ElementRef,
    Input,
    OnChanges,
} from '@angular/core';

import { ValidationService } from '../services/validation.service';

@Directive({
    selector: '[appApiAction]',
})
export class ApiActionDirective implements OnChanges {
    @Input() appApiAction: Promise<any>;

    constructor(private el: ElementRef, private validationService: ValidationService) { }

    ngOnChanges(changes: any) {
        if (this.appApiAction == null || this.appApiAction.then == null) {
            return;
        }

        this.el.nativeElement.loading = true;

        this.appApiAction.then((response: any) => {
            this.el.nativeElement.loading = false;
        }, (e: any) => {
            this.el.nativeElement.loading = false;
            this.validationService.showError(e);
        });
    }
}
