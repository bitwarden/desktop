import * as template from './login.component.html';

import {
    Component,
    OnInit,
} from '@angular/core';

import { Router } from '@angular/router';

import { AuthService } from 'jslib/abstractions/auth.service';

@Component({
    selector: 'app-login',
    template: template,
})
export class LoginComponent implements OnInit {
    email: string = '';
    masterPassword: string = '';

    constructor(private authService: AuthService, private router: Router) {
    }

    ngOnInit() {
        // TODO?
    }

    async onSubmit() {
        const response = await this.authService.logIn(this.email, this.masterPassword);
        this.router.navigate(['vault']);
    }
}
