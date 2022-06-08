import { Component } from "@angular/core";

import { FolderFilterComponent as BaseFolderFilterComponent } from "jslib-angular/modules/vault-filter/components/folder-filter.component";

@Component({
  selector: "app-folder-filter",
  templateUrl: "folder-filter.component.html",
})
export class FolderFilterComponent extends BaseFolderFilterComponent {}
