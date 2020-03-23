import { Component } from '@angular/core';

import { CollectionService } from 'jslib/abstractions/collection.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { UserService } from 'jslib/abstractions/user.service';

import { GroupingsComponent as BaseGroupingsComponent } from 'jslib/angular/components/groupings.component';

@Component({
    selector: 'app-vault-groupings',
    templateUrl: 'groupings.component.html',
})
export class GroupingsComponent extends BaseGroupingsComponent {
    constructor(collectionService: CollectionService, folderService: FolderService,
        storageService: StorageService, userService: UserService) {
        super(collectionService, folderService, storageService, userService);
    }
}
