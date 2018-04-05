import * as template from './groupings.component.html';

import { Component } from '@angular/core';

import { CollectionService } from 'jslib/abstractions/collection.service';
import { FolderService } from 'jslib/abstractions/folder.service';

import { GroupingsComponent as BaseGroupingsComponent } from 'jslib/angular/components/groupings.component';

@Component({
    selector: 'app-vault-groupings',
    template: template,
})
export class GroupingsComponent extends BaseGroupingsComponent {
    constructor(collectionService: CollectionService, folderService: FolderService) {
        super(collectionService, folderService);
    }
}
