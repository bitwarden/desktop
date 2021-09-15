import { Component, OnInit } from '@angular/core';

import { UserService } from 'jslib-common/abstractions/user.service';

@Component({
    selector: 'app-account-switcher',
    templateUrl: 'account-switcher.component.html',
})
export class AccountSwitcherComponent implements OnInit {

    email: string;

    constructor(private userService: UserService) {}

    async ngOnInit() {
        this.email = await this.userService.getEmail();
        // TODO: Need to listen to userService events to refresh when logged in.
    }

}
