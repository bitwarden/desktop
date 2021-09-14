import { Component } from '@angular/core';

import { CollectionService } from 'jslib-common/abstractions/collection.service';
import { FolderService } from 'jslib-common/abstractions/folder.service';
import { StateService } from 'jslib-common/abstractions/state.service';

import { GroupingsComponent as BaseGroupingsComponent } from 'jslib-angular/components/groupings.component';

@Component({
    selector: 'app-vault-groupings',
    templateUrl: 'groupings.component.html',
})
export class GroupingsComponent extends BaseGroupingsComponent {
    constructor(collectionService: CollectionService, folderService: FolderService,
        stateService: StateService) {
        super(collectionService, folderService, stateService);
    }
}
