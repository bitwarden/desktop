import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { ToasterContainerComponent, ToasterConfig } from 'angular2-toaster';

import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    styles: [],
    template: `
        <toaster-container [toasterconfig]="toasterConfig"></toaster-container>
        <router-outlet></router-outlet>`,
})
export class AppComponent {
    toasterConfig: ToasterConfig = new ToasterConfig({
        showCloseButton: true,
        mouseoverTimerStop: true,
        animation: 'flyRight',
        limit: 5,
    });

    constructor(angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics) {
    }
}
