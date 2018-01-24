import * as template from './groupings.component.html';

import {
    Component,
    Input,
    OnInit,
} from '@angular/core';

import { CollectionService } from 'jslib/abstractions/collection.service';
import { FolderService } from 'jslib/abstractions/folder.service';

@Component({
    selector: 'app-vault-groupings',
    template: template,
})
export class GroupingsComponent implements OnInit {
    folders: any[];
    collections: any[];

    constructor(private collectionService: CollectionService, private folderService: FolderService) {

    }

    async ngOnInit() {
        this.folders = await this.folderService.getAllDecrypted();
        this.collections = await this.collectionService.getAllDecrypted();
    }
}
