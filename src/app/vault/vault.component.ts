import * as template from './vault.component.html';

import {
    Component,
    OnInit,
} from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { FolderService } from 'jslib/abstractions/folder.service';

@Component({
    selector: 'app-vault',
    template: template,
})
export class VaultComponent implements OnInit {
    vaultFolders: any[];
    vaultCiphers: any[];
    vaultCollections: any[];

    constructor(private cipherService: CipherService, private collectionService: CollectionService,
        private folderService: FolderService) {

    }

    async ngOnInit() {
        // TODO?

        this.vaultFolders = await this.folderService.getAllDecrypted();
        this.vaultCollections = await this.collectionService.getAllDecrypted();
        this.vaultCiphers = await this.cipherService.getAllDecrypted();
    }
}
