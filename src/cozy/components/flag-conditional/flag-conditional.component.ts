import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
// @ts-ignore
import flag from 'cozy-flags';

/**
 * A component that renders its children only if the correct flag is set to TRUE
 *
 * usage: <app-flag-conditional flagname="some.flag.name"></app-flag-conditional>
 */
@Component({
    selector: 'app-flag-conditional',
    templateUrl: './flag-conditional.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class FlagConditionalComponent implements OnInit, OnDestroy {
    @Input() flagname: string;

    isFlagEnabled = false;

    ngOnDestroy(): void {
        flag.store.removeListener('change', this.flagChanged.bind(this));
    }

    ngOnInit() {
        flag.store.on('change', this.flagChanged.bind(this));

        this.flagChanged();
    }

    flagChanged() {
        this.isFlagEnabled = flag(this.flagname);
    }
}
