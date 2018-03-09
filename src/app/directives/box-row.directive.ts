import {
    Directive,
    ElementRef,
    HostListener,
    OnInit,
} from '@angular/core';

@Directive({
    selector: '[appBoxRow]',
})
export class BoxRowDirective implements OnInit {
    el: HTMLElement = null;
    formEls: NodeListOf<Element>;

    constructor(private elRef: ElementRef) {
        this.el = elRef.nativeElement;
    }

    ngOnInit(): void {
        this.formEls = this.el.querySelectorAll('input:not([type="hidden"]), select, textarea');
        this.formEls.forEach((formEl) => {
            formEl.addEventListener('focus', (event: Event) => {
                this.el.classList.add('active');
            }, false);

            formEl.addEventListener('blur', (event: Event) => {
                this.el.classList.remove('active');
            }, false);
        });
    }

    @HostListener('click', ['$event']) onClick(event: Event) {
        if (event.target !== this.el) {
            return;
        }

        if (this.formEls.length > 0) {
            const formEl = (this.formEls[0] as HTMLElement);
            if (formEl.tagName.toLowerCase() === 'input') {
                const inputEl = (formEl as HTMLInputElement);
                if (inputEl.type != null && inputEl.type.toLowerCase() === 'checkbox') {
                    inputEl.click();
                    return;
                }
            }
            formEl.focus();
        }
    }
}
