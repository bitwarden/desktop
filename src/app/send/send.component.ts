import {
    Component,
    NgZone,
    OnInit,
} from '@angular/core';

import {
    ActivatedRoute ,
    Router,
} from '@angular/router';

import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SearchService } from 'jslib/abstractions/search.service';
import { SendService } from 'jslib/abstractions/send.service';

import { ModalComponent } from 'jslib/angular/components/modal.component';
import { SendComponent as BaseSendComponent } from 'jslib/angular/components/send/send.component';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { SendView } from 'jslib/models/view/sendView';

enum Action {
    None = '',
    Add = 'add',
    Edit = 'edit',
    View = 'view',
}

@Component({
    selector: 'app-send',
    templateUrl: 'send.component.html',
})
export class SendComponent extends BaseSendComponent implements OnInit {
    sendId: string;
    modal: ModalComponent = null;
    action: Action = Action.None;
    selectedSend: SendView;

    constructor(sendService: SendService, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, environmentService: EnvironmentService,
        broadcasterService: BroadcasterService, ngZone: NgZone,
        private router: Router, private route: ActivatedRoute, searchService: SearchService) {
        super(sendService, i18nService, platformUtilsService,
              environmentService, broadcasterService, ngZone, searchService);
    }

    async load(filter: (send: SendView) => boolean = null) {
        this.loading = true;
        this.sends = await this.sendService.getAllDecrypted();

        this.route.queryParams.subscribe(async (params) => {
            this.sendId = params.sendId;
            if (this.sendId != null) {
                this.selectedSend = this.sends.find((s) => s.id === params.sendId);
                params.action === 'edit' ?
                    this.action = Action.Edit :
                    this.action = Action.View;
                return;
            }

            if (params.action === 'add') {
                this.action = Action.Add;
                return;
            }

            this.selectAll();
        });

        this.loading = false;
        this.loaded = true;
    }

    addSend() {
        if (this.action === Action.Add) {
            return;
        }

        this.action = Action.Add;
        this.sendId = null;
        this.go();
    }

    editSend(send: SendView) {
        return;
    }

    selectSend(send: SendView) {
        this.action = Action.View;
        this.sendId = send.id;
        this.go();
    }

    private go(queryParams: any = null) {
        if (queryParams == null) {
            queryParams = {
                id: this.sendId,
                action: this.action,
            };
        }
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: queryParams,
            replaceUrl: true,
        });
    }
}
