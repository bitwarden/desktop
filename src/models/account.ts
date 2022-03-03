import {
  Account as BaseAccount,
  AccountSettings as BaseAccountSettings,
} from "jslib-common/models/domain/account";

export class AccountSettings extends BaseAccountSettings {
  vaultTimeout = -1; // On Restart
}

export class Account extends BaseAccount {
  settings?: AccountSettings = new AccountSettings();

  constructor(init: Partial<Account>) {
    super(init);
    Object.assign(this.settings, {
      ...new AccountSettings(),
      ...this.settings,
    });
  }
}
