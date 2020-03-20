import { Component } from '@angular/core';

import { CollectionService } from 'jslib/abstractions/collection.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { UserService } from 'jslib/abstractions/user.service';

import { GroupingsComponent as BaseGroupingsComponent } from 'jslib/angular/components/groupings.component';

import { CipherType } from 'jslib/enums/cipherType';

import { CollectionView } from 'jslib/models/view/collectionView';
import { FolderView } from 'jslib/models/view/folderView';

@Component({
    selector: 'app-vault-groupings',
    templateUrl: 'groupings.component.html',
})
export class GroupingsComponent extends BaseGroupingsComponent {
    constructor(collectionService: CollectionService, folderService: FolderService,
        storageService: StorageService, userService: UserService) {
        super(collectionService, folderService, storageService, userService);
    }

    selectAll() {
        this.onAllClicked.emit();
    }

    selectFavorites() {
        this.onFavoritesClicked.emit();
    }

    selectType(type: CipherType) {
        this.onCipherTypeClicked.emit(type);
    }

    selectFolder(folder: FolderView) {
        this.onFolderClicked.emit(folder);
    }

    selectCollection(collection: CollectionView) {
        this.onCollectionClicked.emit(collection);
    }
}
