import { Component } from '@angular/core';

import {
    AddEditCustomFieldsComponent as BaseAddEditCustomFieldsComponent
} from 'jslib-angular/components/add-edit-custom-fields.component';

import { EventService } from 'jslib-common/abstractions/event.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';

@Component({
    selector: 'app-vault-add-edit-custom-fields',
    templateUrl: 'add-edit-custom-fields.component.html',
})
export class AddEditCustomFieldsComponent extends BaseAddEditCustomFieldsComponent {
    constructor(i18nService: I18nService, eventService: EventService) {
        super(i18nService, eventService);
    }
}
