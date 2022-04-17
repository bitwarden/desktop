import { Inject, Injectable } from "@angular/core";

import {
  SECURE_STORAGE,
  STATE_FACTORY,
  STATE_SERVICE_USE_CACHE,
} from "jslib-angular/services/jslib-services.module";
import { LogService } from "jslib-common/abstractions/log.service";
import { StateService as StateServiceAbstraction } from "jslib-common/abstractions/state.service";
import { StateMigrationService } from "jslib-common/abstractions/stateMigration.service";
import { StorageService } from "jslib-common/abstractions/storage.service";
import { StateFactory } from "jslib-common/factories/stateFactory";
import { GlobalState } from "jslib-common/models/domain/globalState";
import { StateService as BaseStateService } from "jslib-common/services/state.service";

import { Account } from "../models/account";

@Injectable()
export class StateService
  extends BaseStateService<GlobalState, Account>
  implements StateServiceAbstraction
{
  constructor(
    storageService: StorageService,
    @Inject(SECURE_STORAGE) secureStorageService: StorageService,
    logService: LogService,
    stateMigrationService: StateMigrationService,
    @Inject(STATE_FACTORY) stateFactory: StateFactory<GlobalState, Account>,
    @Inject(STATE_SERVICE_USE_CACHE) useAccountCache: boolean
  ) {
    super(
      storageService,
      secureStorageService,
      logService,
      stateMigrationService,
      stateFactory,
      useAccountCache
    );
  }

  async addAccount(account: Account) {
    // Apply desktop overides to default account values
    account = new Account(account);
    await super.addAccount(account);
  }
}
