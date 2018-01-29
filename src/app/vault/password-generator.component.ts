import * as template from './password-generator.component.html';

import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { CipherType } from 'jslib/enums/cipherType';

import { CollectionService } from 'jslib/abstractions/collection.service';

@Component({
    selector: 'password-generator',
    template: template,
})
export class PasswordGeneratorComponent implements OnInit {
    @Input() in: string;
    @Output() out = new EventEmitter<string>();

    constructor() {
        // ctor
    }

    async ngOnInit() {
        console.log(this.in);
        setTimeout(() => { this.out.emit('world'); }, 2000);
    }
}
