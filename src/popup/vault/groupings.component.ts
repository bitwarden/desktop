import { Angulartics2 } from 'angulartics2';

import {
    ChangeDetectorRef,
    Component,
    NgZone,
    OnDestroy,
    OnInit,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { BrowserApi } from '../../browser/browserApi';

import { CipherType } from 'jslib/enums/cipherType';

import { CipherView } from 'jslib/models/view/cipherView';
import { CollectionView } from 'jslib/models/view/collectionView';
import { FolderView } from 'jslib/models/view/folderView';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { StateService } from 'jslib/abstractions/state.service';
import { SyncService } from 'jslib/abstractions/sync.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { GroupingsComponent as BaseGroupingsComponent } from 'jslib/angular/components/groupings.component';

import { PopupUtilsService } from '../services/popup-utils.service';

const ComponentId = 'GroupingsComponent';

@Component({
    selector: 'app-vault-groupings',
    templateUrl: 'groupings.component.html',
})
export class GroupingsComponent extends BaseGroupingsComponent implements OnInit, OnDestroy {
    ciphers: CipherView[];
    favoriteCiphers: CipherView[];
    noFolderCiphers: CipherView[];
    folderCount: number;
    folderCounts = new Map<string, number>();
    collectionCounts = new Map<string, number>();
    typeCounts = new Map<CipherType, number>();
    showNoFolderCiphers = false;
    searchText: string;
    state: any;
    loadedTimeout: number;
    selectedTimeout: number;
    preventSelected = false;

    constructor(collectionService: CollectionService, folderService: FolderService,
        private cipherService: CipherService, private router: Router,
        private ngZone: NgZone, private broadcasterService: BroadcasterService,
        private changeDetectorRef: ChangeDetectorRef, private route: ActivatedRoute,
        private stateService: StateService, private popupUtils: PopupUtilsService,
        private syncService: SyncService, private analytics: Angulartics2) {
        super(collectionService, folderService);
    }

    ngOnInit() {
        this.stateService.remove('CiphersComponent');

        this.broadcasterService.subscribe(ComponentId, (message: any) => {
            this.ngZone.run(async () => {
                switch (message.command) {
                    case 'syncCompleted':
                        window.setTimeout(() => {
                            this.load();
                        }, 500);
                        break;
                    default:
                        break;
                }

                this.changeDetectorRef.detectChanges();
            });
        });

        this.route.queryParams.subscribe(async (params) => {
            this.state = (await this.stateService.get<any>(ComponentId)) || {};
            if (this.state.searchText) {
                this.searchText = this.state.searchText;
            } else if (params.searchText) {
                this.searchText = params.searchText;
            }

            if (!this.syncService.syncInProgress) {
                this.load();
                window.setTimeout(() => this.popupUtils.setContentScrollY(window, this.state.scrollY), 0);
            } else {
                this.loadedTimeout = window.setTimeout(async () => {
                    if (!this.loaded) {
                        await this.load();
                    }
                }, 10000);
            }
        });
    }

    ngOnDestroy() {
        if (this.loadedTimeout != null) {
            window.clearTimeout(this.loadedTimeout);
        }
        if (this.selectedTimeout != null) {
            window.clearTimeout(this.selectedTimeout);
        }
        this.saveState();
        this.broadcasterService.unsubscribe(ComponentId);
    }

    async load() {
        await super.load();
        super.loaded = false;

        await this.loadCiphers();
        this.showNoFolderCiphers = this.noFolderCiphers != null && this.noFolderCiphers.length < 100 &&
            this.collections.length === 0;
        if (this.showNoFolderCiphers) {
            // Remove "No Folder" from folder listing
            this.folders.pop();
            this.folderCount = this.folders.length;
        } else {
            this.folderCount = this.folders.length - 1;
        }

        super.loaded = true;
    }

    async loadCiphers() {
        this.ciphers = await this.cipherService.getAllDecrypted();
        this.ciphers.forEach((c) => {
            if (c.favorite) {
                if (this.favoriteCiphers == null) {
                    this.favoriteCiphers = [];
                }
                this.favoriteCiphers.push(c);
            }

            if (c.folderId == null) {
                if (this.noFolderCiphers == null) {
                    this.noFolderCiphers = [];
                }
                this.noFolderCiphers.push(c);
            }

            if (this.typeCounts.has(c.type)) {
                this.typeCounts.set(c.type, this.typeCounts.get(c.type) + 1);
            } else {
                this.typeCounts.set(c.type, 1);
            }

            if (this.folderCounts.has(c.folderId)) {
                this.folderCounts.set(c.folderId, this.folderCounts.get(c.folderId) + 1);
            } else {
                this.folderCounts.set(c.folderId, 1);
            }

            if (c.collectionIds != null) {
                c.collectionIds.forEach((colId) => {
                    if (this.collectionCounts.has(colId)) {
                        this.collectionCounts.set(colId, this.collectionCounts.get(colId) + 1);
                    } else {
                        this.collectionCounts.set(colId, 1);
                    }
                });
            }
        });
    }

    async selectType(type: CipherType) {
        super.selectType(type);
        this.router.navigate(['/ciphers'], { queryParams: { type: type } });
    }

    async selectFolder(folder: FolderView) {
        super.selectFolder(folder);
        this.router.navigate(['/ciphers'], { queryParams: { folderId: folder.id || 'none' } });
    }

    async selectCollection(collection: CollectionView) {
        super.selectCollection(collection);
        this.router.navigate(['/ciphers'], { queryParams: { collectionId: collection.id } });
    }

    async selectCipher(cipher: CipherView) {
        this.selectedTimeout = window.setTimeout(() => {
            if (!this.preventSelected) {
                this.router.navigate(['/view-cipher'], { queryParams: { cipherId: cipher.id } });
            }
            this.preventSelected = false;
        }, 200);
    }

    async launchCipher(cipher: CipherView) {
        if (cipher.type !== CipherType.Login || !cipher.login.canLaunch) {
            return;
        }

        if (this.selectedTimeout != null) {
            window.clearTimeout(this.selectedTimeout);
        }
        this.preventSelected = true;
        this.analytics.eventTrack.next({ action: 'Launched URI From Listing' });
        BrowserApi.createNewTab(cipher.login.uri);
        if (this.popupUtils.inPopup(window)) {
            BrowserApi.closePopup(window);
        }
    }

    async addCipher() {
        this.router.navigate(['/add-cipher']);
    }

    private async saveState() {
        this.state = {
            scrollY: this.popupUtils.getContentScrollY(window),
            searchText: this.searchText,
        };
        await this.stateService.save(ComponentId, this.state);
    }
}
