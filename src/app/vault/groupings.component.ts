import * as template from './groupings.component.html';

import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { CipherType } from 'jslib/enums/cipherType';

import { CollectionView } from 'jslib/models/view/collectionView';
import { FolderView } from 'jslib/models/view/folderView';

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
    @Output() onAddFolder = new EventEmitter();
    @Output() onEditFolder = new EventEmitter<FolderView>();
    @Output() onCollectionClicked = new EventEmitter<CollectionView>();

    folders: any[];
    collections: any[];
    cipherType = CipherType;
    selectedAll: boolean = false;
    selectedFavorites: boolean = false;
    selectedType: CipherType = null;
    selectedFolder: boolean = false;
    selectedFolderId: string = null;
    selectedCollectionId: string = null;

    constructor(private collectionService: CollectionService, private folderService: FolderService) {
        // ctor
    }

    async ngOnInit() {
        await this.loadFolders();
        this.collections = await this.collectionService.getAllDecrypted();
    }

    async loadFolders() {
        this.folders = await this.folderService.getAllDecrypted();
    }

    all() {
        this.clearSelections();
        this.selectedAll = true;
        this.onAllClicked.emit();
    }

    favorites() {
        this.clearSelections();
        this.selectedFavorites = true;
        this.onFavoritesClicked.emit();
    }

    type(type: CipherType) {
        this.clearSelections();
        this.selectedType = type;
        this.onCipherTypeClicked.emit(type);
    }

    folder(folder: FolderView) {
        this.clearSelections();
        this.selectedFolder = true;
        this.selectedFolderId = folder.id;
        this.onFolderClicked.emit(folder);
    }

    addFolder() {
        this.onAddFolder.emit();
    }

    editFolder(folder: FolderView) {
        this.onEditFolder.emit(folder);
    }

    collection(collection: CollectionView) {
        this.clearSelections();
        this.selectedCollectionId = collection.id;
        this.onCollectionClicked.emit(collection);
    }

    clearSelections() {
        this.selectedAll = false;
        this.selectedFavorites = false;
        this.selectedType = null;
        this.selectedFolder = false;
        this.selectedFolderId = null;
        this.selectedCollectionId = null;
    }
}
