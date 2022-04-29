import { animate, state, style, transition, trigger } from "@angular/animations";
import { ConnectedPosition } from "@angular/cdk/overlay";
import { Component, OnInit } from "@angular/core";

import { AuthService } from "jslib-common/abstractions/auth.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { AuthenticationStatus } from "jslib-common/enums/authenticationStatus";
import { Utils } from "jslib-common/misc/utils";
import { Account } from "jslib-common/models/domain/account";

export class SwitcherAccount extends Account {
  get serverUrl() {
    return this.removeWebProtocolFromString(
      this.settings?.environmentUrls?.base ??
        this.settings?.environmentUrls.api ??
        "https://bitwarden.com"
    );
  }

  private removeWebProtocolFromString(urlString: string) {
    const regex = /http(s)?(:)?(\/\/)?|(\/\/)?(www\.)?/g;
    return urlString.replace(regex, "");
  }
}

@Component({
  selector: "app-account-switcher",
  templateUrl: "account-switcher.component.html",
  animations: [
    trigger("transformPanel", [
      state(
        "void",
        style({
          opacity: 0,
        })
      ),
      transition(
        "void => open",
        animate(
          "100ms linear",
          style({
            opacity: 1,
          })
        )
      ),
      transition("* => void", animate("100ms linear", style({ opacity: 0 }))),
    ]),
  ],
})
export class AccountSwitcherComponent implements OnInit {
  isOpen = false;
  accounts: { [userId: string]: SwitcherAccount } = {};
  activeAccountEmail: string;
  serverUrl: string;
  authStatus = AuthenticationStatus;
  overlayPostition: ConnectedPosition[] = [
    {
      originX: "end",
      originY: "bottom",
      overlayX: "end",
      overlayY: "top",
    },
  ];

  get showSwitcher() {
    const userIsInAVault = !Utils.isNullOrWhitespace(this.activeAccountEmail);
    const userIsAddingAnAdditionalAccount = Object.keys(this.accounts).length > 0;
    return userIsInAVault || userIsAddingAnAdditionalAccount;
  }

  get numberOfAccounts() {
    if (this.accounts == null) {
      this.isOpen = false;
      return 0;
    }
    return Object.keys(this.accounts).length;
  }

  constructor(
    private stateService: StateService,
    private authService: AuthService,
    private messagingService: MessagingService
  ) {}

  async ngOnInit(): Promise<void> {
    this.stateService.accounts.subscribe(async (accounts: { [userId: string]: Account }) => {
      for (const userId in accounts) {
        accounts[userId].profile.authenticationStatus = await this.authService.getAuthStatus(
          userId
        );
      }

      this.accounts = await this.createSwitcherAccounts(accounts);
      this.activeAccountEmail = await this.stateService.getEmail();
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  close() {
    this.isOpen = false;
  }

  async switch(userId: string) {
    this.close();

    this.messagingService.send("switchAccount", { userId: userId });
  }

  async addAccount() {
    this.close();
    await this.stateService.setActiveUser(null);
  }

  private async createSwitcherAccounts(baseAccounts: {
    [userId: string]: Account;
  }): Promise<{ [userId: string]: SwitcherAccount }> {
    const switcherAccounts: { [userId: string]: SwitcherAccount } = {};
    for (const userId in baseAccounts) {
      if (userId == null || userId === (await this.stateService.getUserId())) {
        continue;
      }

      // environmentUrls are stored on disk and must be retrieved seperatly from the in memory state offered from subscribing to accounts
      baseAccounts[userId].settings.environmentUrls = await this.stateService.getEnvironmentUrls({
        userId: userId,
      });
      switcherAccounts[userId] = new SwitcherAccount(baseAccounts[userId]);
    }
    return switcherAccounts;
  }
}
