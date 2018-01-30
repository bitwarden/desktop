import {
    Directive,
    ElementRef,
    Input,
} from '@angular/core';

@Directive({
    selector: '[appAutofocus]',
})
export class AutofocusDirective {
    @Input() set appAutofocus(condition: boolean | string) {
        this._autofocus = condition === '' || condition === true;
    }

    private _autofocus: boolean;

    constructor(private el: ElementRef) { }

    ngOnInit() {
        if (this._autofocus) {
            this.el.nativeElement.focus();
        }
    }
}
