import {
    Component,
} from '@angular/core';

import { EventService } from 'jslib-common/abstractions/event.service';

import {
    ViewCustomFieldsComponent as BaseViewCustomFieldsComponent
} from 'jslib-angular/components/view-custom-fields.component';

@Component({
    selector: 'app-vault-view-custom-fields',
    templateUrl: 'view-custom-fields.component.html',
})
export class ViewCustomFieldsComponent extends BaseViewCustomFieldsComponent {
    constructor(eventService: EventService) {
        super(eventService);
    }
}
