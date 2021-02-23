import { Component, EventEmitter, Output } from '@angular/core';

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

    @Output() onToolClicked = new EventEmitter<string>();

    selectedTool: string = null;

    constructor(collectionService: CollectionService, folderService: FolderService,
        storageService: StorageService, userService: UserService,
        private broadcasterService: BroadcasterService) {
        super(collectionService, folderService, storageService, userService);
    }

    lock() {
        this.broadcasterService.send({command: 'lockVault'});
    }

    logout() {
        this.broadcasterService.send({command: 'logout'});
    }
    clearSelections() {
        super.clearSelections();
        this.selectedTool = null;
    }

    selectInstallation() {
        console.log('selectInstallation()');
        this.clearSelections();
        this.selectedTool = 'installation';
        this.onToolClicked.emit('installation');
    }

    selectImport() {
        console.log('selectImport()');
        this.clearSelections();
        this.selectedTool = 'import';
        this.onToolClicked.emit('import');
    }

}
