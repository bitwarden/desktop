import {
    animate,
    state,
    style,
    transition,
    trigger,
  } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';

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
    accounts: { [userId: string]: Account };
    activeAccountEmail: string;

    constructor(private stateService: StateService, private vaultTimeoutService: VaultTimeoutService,
        private messagingService: MessagingService, private router: Router) {}

    async ngOnInit(): Promise<void> {
        this.stateService.accounts.subscribe(async accounts => {
            this.accounts = accounts;
            this.activeAccountEmail = await this.stateService.getEmail();
        });
    }

    toggle() {
        this.isOpen = !this.isOpen;
    }

    async switch(userId: string) {
        await this.stateService.setActiveUser(userId);
        const locked = await this.vaultTimeoutService.isLocked(userId);
        if (locked) {
            this.messagingService.send('locked', { userId: userId });
        } else {
            this.messagingService.send('unlocked');
            this.messagingService.send('syncVault');
            this.router.navigate(['vault']);
        }
    }
}
