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

import { CipherService } from 'jslib/abstractions/cipher.service';
import { StateService } from 'jslib/abstractions/state.service';

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
    searchText: string;
    state: any;

    constructor(cipherService: CipherService, private route: ActivatedRoute,
        private router: Router, private location: Location,
        private ngZone: NgZone, private broadcasterService: BroadcasterService,
        private changeDetectorRef: ChangeDetectorRef, private stateService: StateService,
        private popupUtils: PopupUtilsService) {
        super(cipherService);
    }

    async ngOnInit() {
        this.route.queryParams.subscribe(async (params) => {
            if (params.type) {
                const t = parseInt(params.type, null);
                await super.load((c) => c.type === t);
            } else if (params.folderId) {
                await super.load((c) => c.folderId === params.folderId);
            } else if (params.collectionId) {
                await super.load((c) => c.collectionIds.indexOf(params.collectionId) > -1);
            } else {
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
                            this.load();
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
        this.router.navigate(['/add-cipher']);
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
