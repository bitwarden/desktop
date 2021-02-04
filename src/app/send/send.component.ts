import {
    Component,
    NgZone,
    OnInit,
} from '@angular/core';

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

    constructor(sendService: SendService, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, environmentService: EnvironmentService,
        broadcasterService: BroadcasterService, ngZone: NgZone,
        searchService: SearchService) {
        super(sendService, i18nService, platformUtilsService,
              environmentService, broadcasterService, ngZone, searchService);
    }

    addSend() {
        this.action = Action.Add;
        this.sendId = null;
    }

    editSend(send: SendView) {
        return;
    }

    selectSend(send: SendView) {
        this.action = Action.View;
        this.sendId = send.id;
    }

    get selectedSend() {
        return this.sends.find((s) => s.id === this.sendId);
    }
}
