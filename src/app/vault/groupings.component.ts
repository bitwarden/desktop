import { Component, EventEmitter, Output } from '@angular/core';
import { CAN_SHARE_ORGANIZATION } from '../../cozy/flags';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { UserService } from 'jslib/abstractions/user.service';

import { GroupingsComponent as BaseGroupingsComponent } from 'jslib/angular/components/groupings.component';
import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

@Component({
    selector: 'app-vault-groupings',
    templateUrl: 'groupings.component.html',
})
export class GroupingsComponent extends BaseGroupingsComponent {

    @Output() onImportClicked = new EventEmitter<void>();
    importSelected = false;
    CAN_SHARE_ORGANIZATION = CAN_SHARE_ORGANIZATION;

    hasNotes: boolean;
    private prevSelection: any = new Object();

    constructor(collectionService: CollectionService, folderService: FolderService,
        storageService: StorageService, userService: UserService,
        private broadcasterService: BroadcasterService, private cipherService: CipherService) {
        super(collectionService, folderService, storageService, userService);
    }

    async load(setLoaded = true) {
        // check if there are notes to display
        const ciphers = await this.cipherService.getAllDecrypted();
        const noteIndex = ciphers.findIndex(c => {
            return (c.type === 2 && !c.isDeleted);
        });
        this.hasNotes = (noteIndex > -1) ;
        // run super
        super.load(setLoaded);
    }

    lock() {
        this.broadcasterService.send({command: 'lockVault'});
    }

    logout() {
        this.broadcasterService.send({command: 'logout'});
    }
    clearSelections() {
        this.prevSelection.selectedAll          = this.selectedAll         ;
        this.prevSelection.selectedFavorites    = this.selectedFavorites   ;
        this.prevSelection.selectedTrash        = this.selectedTrash       ;
        this.prevSelection.selectedType         = this.selectedType        ;
        this.prevSelection.selectedFolder       = this.selectedFolder      ;
        this.prevSelection.selectedFolderId     = this.selectedFolderId    ;
        this.prevSelection.selectedCollectionId = this.selectedCollectionId;
        this.importSelected = false;
        super.clearSelections();
    }

    selectImport() {
        this.clearSelections();
        this.importSelected = true;
        this.onImportClicked.emit();
    }

    revertSelection() {
        this.selectedAll          = this.prevSelection.selectedAll         ;
        this.selectedFavorites    = this.prevSelection.selectedFavorites   ;
        this.selectedTrash        = this.prevSelection.selectedTrash       ;
        this.selectedType         = this.prevSelection.selectedType        ;
        this.selectedFolder       = this.prevSelection.selectedFolder      ;
        this.selectedFolderId     = this.prevSelection.selectedFolderId    ;
        this.selectedCollectionId = this.prevSelection.selectedCollectionId;
    }

}
