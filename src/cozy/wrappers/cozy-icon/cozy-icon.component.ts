import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-cozy-icon',
    templateUrl: './cozy-icon.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class CozyIconComponent {
    @Input() ref: string;
    @Input() width: number = 16;
    @Input() height: number = 16;
}
