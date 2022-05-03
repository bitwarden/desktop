import { Component } from "@angular/core";

import { CollectionFilterComponent as BaseCollectionFilterComponent } from "jslib-angular/modules/vault-filter/components/collection-filter.component";

@Component({
  selector: "app-collection-filter",
  templateUrl: "collection-filter.component.html",
})
export class CollectionFilterComponent extends BaseCollectionFilterComponent {}
