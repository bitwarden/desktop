import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";

import { SearchBarService, SearchBarState } from "./search-bar.service";

@Component({
    selector: "app-search",
    templateUrl: "search.component.html",
})
export class SearchComponent {
    state: SearchBarState;
    searchText: FormControl = new FormControl(null);

    constructor(private searchBarService: SearchBarService) {
        this.searchBarService.state.subscribe((state) => {
            this.state = state;
        });

        this.searchText.valueChanges.subscribe((value) => {
            this.searchBarService.setSearchText(value);
        });
    }
}
