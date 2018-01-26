import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    styles: [],
    template: '<router-outlet></router-outlet>',
})
export class AppComponent {
    constructor(angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics) {
    }
}
