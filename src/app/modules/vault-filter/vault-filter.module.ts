import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { JslibModule } from "jslib-angular/jslib.module";
import { VaultFilterService } from "jslib-angular/modules/vault-filter/vault-filter.service";

import { CollectionFilterComponent } from "./components/collection-filter.component";
import { FolderFilterComponent } from "./components/folder-filter.component";
import { OrganizationFilterComponent } from "./components/organization-filter.component";
import { StatusFilterComponent } from "./components/status-filter.component";
import { TypeFilterComponent } from "./components/type-filter.component";
import { VaultFilterComponent } from "./vault-filter.component";

@NgModule({
  imports: [BrowserModule, JslibModule],
  declarations: [
    VaultFilterComponent,
    CollectionFilterComponent,
    FolderFilterComponent,
    OrganizationFilterComponent,
    StatusFilterComponent,
    TypeFilterComponent,
  ],
  exports: [VaultFilterComponent],
  providers: [VaultFilterService],
})
export class VaultFilterModule {}
