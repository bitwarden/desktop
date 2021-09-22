import {
    animate,
    state,
    style,
    transition,
    trigger,
  } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

import { UserService } from 'jslib-common/abstractions/user.service';

// TODO: This should be moved
enum AccountStatus {
    Active = 'active',
    Unlocked = 'inactive',
    Locked = 'locked',
}

@Component({
    selector: 'app-account-switcher',
    templateUrl: 'account-switcher.component.html',
    animations: [
        trigger('transformPanel', [
            state('void', style({
              opacity: 0,
            })),
            transition('void => open',  animate('100ms linear', style({
              opacity: 1,
            }))),
            transition('* => void', animate('100ms linear', style({opacity: 0}))),
        ]),
    ],
})
export class AccountSwitcherComponent implements OnInit {

    email: string;
    accounts: { email: string, server: string, status: AccountStatus }[] = [];
    isOpen: boolean = false;
    accountStatuses = AccountStatus;

    constructor(private userService: UserService) {}

    async ngOnInit() {
        this.email = await this.userService.getEmail();

        // TODO: Fetch this data dynamically
        this.accounts = [
            {
                email: this.email,
                server: 'bitwarden.com',
                status: AccountStatus.Active,
            },
            {
                email: 'robb@stark.com',
                server: 'stark.com',
                status: AccountStatus.Unlocked,
            },
            {
                email: 'robb@stark-business.com',
                server: 'stark-business.com',
                status: AccountStatus.Locked,
            },
        ];

        // TODO: Need to listen to userService events to refresh when logged in.
    }

    toggle() {
        this.isOpen = !this.isOpen;
    }

    switch(account: any) {
        // TODO: Implement switch logic
    }

    add() {
        // TODO: Implement add logic
    }
}
