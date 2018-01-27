import * as template from './groupings.component.html';

import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { CipherType } from 'jslib/enums/cipherType';

import { FolderView } from 'jslib/models/view/folderView';
import { CollectionView } from 'jslib/models/view/collectionView';

import { CollectionService } from 'jslib/abstractions/collection.service';
import { FolderService } from 'jslib/abstractions/folder.service';

@Component({
    selector: 'app-vault-groupings',
    template: template,
})
export class GroupingsComponent implements OnInit {
    @Output() onAllClicked = new EventEmitter();
    @Output() onFavoritesClicked = new EventEmitter();
    @Output() onCipherTypeClicked = new EventEmitter<CipherType>();
    @Output() onFolderClicked = new EventEmitter<FolderView>();
    @Output() onCollectionClicked = new EventEmitter<CollectionView>();

    folders: any[];
    collections: any[];
    cipherType = CipherType;

    constructor(private collectionService: CollectionService, private folderService: FolderService) {
        // ctor
    }

    async ngOnInit() {
        this.folders = await this.folderService.getAllDecrypted();
        this.collections = await this.collectionService.getAllDecrypted();
    }

    all() {
        this.onAllClicked.emit();
    }

    favorites() {
        this.onFavoritesClicked.emit();
    }

    type(type: CipherType) {
        this.onCipherTypeClicked.emit(type);
    }

    folder(folder: FolderView) {
        this.onFolderClicked.emit(folder);
    }

    collection(collection: CollectionView) {
        this.onCollectionClicked.emit(collection);
    }
}
