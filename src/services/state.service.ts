import { StateService as BaseStateService } from "jslib-common/services/state.service";

import { Account } from "../models/account";

import { StateService as StateServiceAbstraction } from "jslib-common/abstractions/state.service";

export class StateService extends BaseStateService<Account> implements StateServiceAbstraction {
  async addAccount(account: Account) {
    // Apply desktop overides to default account values
    account = new Account(account);
    await super.addAccount(account);
  }
}
