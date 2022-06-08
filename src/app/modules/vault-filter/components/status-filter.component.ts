import { Component } from "@angular/core";

import { StatusFilterComponent as BaseStatusFilterComponent } from "jslib-angular/modules/vault-filter/components/status-filter.component";

@Component({
  selector: "app-status-filter",
  templateUrl: "status-filter.component.html",
})
export class StatusFilterComponent extends BaseStatusFilterComponent {}
