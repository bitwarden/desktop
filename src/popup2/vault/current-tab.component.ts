import {
    Component,
    ComponentFactoryResolver,
    NgZone,
    OnDestroy,
    OnInit,
    Type,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-vault-tab',
    styles: [],
    template: `Current Tab`,
})
export class CurrentTabComponent {
    constructor() {

    }
}
