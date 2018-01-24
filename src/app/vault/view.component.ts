import * as template from './view.component.html';

import {
    Component,
    Input,
    OnChanges,
} from '@angular/core';

@Component({
    selector: 'app-vault-view',
    template: template,
})
export class ViewComponent implements OnChanges {
    @Input() cipherId: string;

    constructor() {
        
    }

    ngOnChanges() {
        
    }
}
