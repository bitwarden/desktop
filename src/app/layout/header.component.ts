import { Component } from '@angular/core';

import { I18nService } from 'jslib-common/abstractions/i18n.service';

@Component({
    selector: 'app-header',
    templateUrl: 'header.component.html',
})
export class HeaderComponent {
    constructor(private i18nService: I18nService) {}
}
