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

import { CipherView } from 'jslib/models/view/cipherView';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { CiphersComponent as BaseCiphersComponent } from 'jslib/angular/components/ciphers.component';

const BroadcasterSubscriptionId = 'CiphersComponent';

@Component({
    selector: 'app-vault-ciphers',
    templateUrl: 'ciphers.component.html',
})
export class CiphersComponent extends BaseCiphersComponent implements OnInit, OnDestroy {
    constructor(cipherService: CipherService, private route: ActivatedRoute,
        private router: Router, private location: Location,
        private ngZone: NgZone, private broadcasterService: BroadcasterService,
        private changeDetectorRef: ChangeDetectorRef) {
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
        });

        this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
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
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
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
}
