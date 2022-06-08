import { Component } from "@angular/core";

import { VaultFilterComponent as BaseVaultFilterComponent } from "jslib-angular/modules/vault-filter/vault-filter.component";

@Component({
  selector: "app-vault-filter",
  templateUrl: "vault-filter.component.html",
})
export class VaultFilterComponent extends BaseVaultFilterComponent {}
