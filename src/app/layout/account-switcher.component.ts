import {
    animate,
    state,
    style,
    transition,
    trigger,
  } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

import { StateService } from 'jslib-common/abstractions/state.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';

import { Account } from 'jslib-common/models/domain/account';

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
    isOpen: boolean = false;
    activeAccountEmail: string;

    get accounts(): Record<string, Account> {
        return this.stateService.accounts.getValue();
    }

    constructor(private stateService: StateService, private syncService: SyncService) {}

    async ngOnInit(): Promise<void> {
        this.activeAccountEmail = await this.stateService.getEmail();
    }

    toggle() {
        this.isOpen = !this.isOpen;
    }

    async switch(userId: string) {
        await this.stateService.setActiveUser(userId);
        await this.syncService.fullSync(true);
    }
}
