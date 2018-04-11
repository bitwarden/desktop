import { Location } from '@angular/common';
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

import { FolderService } from 'jslib/abstractions/folder.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { StateService } from 'jslib/abstractions/state.service';

import { CipherType } from 'jslib/enums/cipherType';

import { CipherView } from 'jslib/models/view/cipherView';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { CiphersComponent as BaseCiphersComponent } from 'jslib/angular/components/ciphers.component';

import { PopupUtilsService } from '../services/popup-utils.service';

const ComponentId = 'CiphersComponent';

@Component({
    selector: 'app-vault-ciphers',
    templateUrl: 'ciphers.component.html',
})
export class CiphersComponent extends BaseCiphersComponent implements OnInit, OnDestroy {
    groupingTitle: string;
    searchText: string;
    state: any;
    showAdd = true;
    folderId: string = null;
    type: CipherType = null;

    constructor(cipherService: CipherService, private route: ActivatedRoute,
        private router: Router, private location: Location,
        private ngZone: NgZone, private broadcasterService: BroadcasterService,
        private changeDetectorRef: ChangeDetectorRef, private stateService: StateService,
        private popupUtils: PopupUtilsService, private i18nService: I18nService,
        private folderService: FolderService, private collectionService: CollectionService) {
        super(cipherService);
    }

    async ngOnInit() {
        this.route.queryParams.subscribe(async (params) => {
            if (params.type) {
                this.searchPlaceholder = this.i18nService.t('searchType');
                this.type = parseInt(params.type, null);
                switch (this.type) {
                    case CipherType.Login:
                        this.groupingTitle = this.i18nService.t('logins');
                        break;
                    case CipherType.Card:
                        this.groupingTitle = this.i18nService.t('cards');
                        break;
                    case CipherType.Identity:
                        this.groupingTitle = this.i18nService.t('identities');
                        break;
                    case CipherType.SecureNote:
                        this.groupingTitle = this.i18nService.t('secureNotes');
                        break;
                    default:
                        break;
                }
                await super.load((c) => c.type === this.type);
            } else if (params.folderId) {
                this.folderId = params.folderId === 'none' ? null : params.folderId;
                this.searchPlaceholder = this.i18nService.t('searchFolder');
                if (this.folderId != null) {
                    const folder = await this.folderService.get(this.folderId);
                    if (folder != null) {
                        this.groupingTitle = (await folder.decrypt()).name;
                    }
                } else {
                    this.groupingTitle = this.i18nService.t('noneFolder');
                }
                await super.load((c) => c.folderId === this.folderId);
            } else if (params.collectionId) {
                this.showAdd = false;
                this.searchPlaceholder = this.i18nService.t('searchCollection');
                const collection = await this.collectionService.get(params.collectionId);
                if (collection != null) {
                    this.groupingTitle = (await collection.decrypt()).name;
                }
                await super.load((c) => c.collectionIds != null && c.collectionIds.indexOf(params.collectionId) > -1);
            } else {
                this.groupingTitle = this.i18nService.t('allItems');
                await super.load();
            }

            this.state = (await this.stateService.get<any>(ComponentId)) || {};
            if (this.state.searchText) {
                this.searchText = this.state.searchText;
            }
            window.setTimeout(() => this.popupUtils.setContentScrollY(window, this.state.scrollY), 0);
        });

        this.broadcasterService.subscribe(ComponentId, (message: any) => {
            this.ngZone.run(async () => {
                switch (message.command) {
                    case 'syncCompleted':
                        window.setTimeout(() => {
                            this.refresh();
                        }, 500);
                        break;
                    default:
                        break;
                }

                this.changeDetectorRef.detectChanges();
            })
        });
    }

    ngOnDestroy() {
        this.saveState();
        this.broadcasterService.unsubscribe(ComponentId);
    }

    selectCipher(cipher: CipherView) {
        super.selectCipher(cipher);
        this.router.navigate(['/view-cipher'], { queryParams: { cipherId: cipher.id } });
    }

    addCipher() {
        super.addCipher();
        this.router.navigate(['/add-cipher'], { queryParams: { folderId: this.folderId, type: this.type } });
    }

    back() {
        this.location.back();
    }

    private async saveState() {
        this.state = {
            scrollY: this.popupUtils.getContentScrollY(window),
            searchText: this.searchText,
        };
        await this.stateService.save(ComponentId, this.state);
    }
}
