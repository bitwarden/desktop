import { StateService as StateServiceAbstraction } from "jslib-common/abstractions/state.service";
import { GlobalState } from "jslib-common/models/domain/globalState";
import { StateService as BaseStateService } from "jslib-common/services/state.service";

import { Account } from "../models/account";

export class StateService
  extends BaseStateService<GlobalState, Account>
  implements StateServiceAbstraction
{
  async addAccount(account: Account) {
    // Apply desktop overides to default account values
    account = new Account(account);
    await super.addAccount(account);
  }
}
