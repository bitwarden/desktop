import * as template from './login.component.html';

import {
    Component,
    OnInit,
} from '@angular/core';

import { AuthService } from 'jslib/abstractions/auth.service';

@Component({
    selector: 'app-login',
    template: template
})
export class LoginComponent implements OnInit {
    constructor(authService: AuthService) {
        console.log(authService);
    }

    ngOnInit() {
        // TODO?
    }
}
