import {
    Component,
    NgZone,
    OnInit,
    ViewChild,
} from '@angular/core';

import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { PolicyService } from 'jslib/abstractions/policy.service';
import { SearchService } from 'jslib/abstractions/search.service';
import { SendService } from 'jslib/abstractions/send.service';
import { UserService } from 'jslib/abstractions/user.service';

import { SendComponent as BaseSendComponent } from 'jslib/angular/components/send/send.component';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { SendView } from 'jslib/models/view/sendView';

import { AddEditComponent } from './add-edit.component';

enum Action {
    None = '',
    Add = 'add',
    Edit = 'edit',
}

@Component({
    selector: 'app-send',
    templateUrl: 'send.component.html',
})
export class SendComponent extends BaseSendComponent implements OnInit {
    @ViewChild(AddEditComponent) addEditComponent: AddEditComponent;

    sendId: string;
    action: Action = Action.None;

    constructor(sendService: SendService, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, environmentService: EnvironmentService,
        broadcasterService: BroadcasterService, ngZone: NgZone,
        searchService: SearchService, policyService: PolicyService,
        userService: UserService) {
        super(sendService, i18nService, platformUtilsService,
              environmentService, broadcasterService, ngZone, searchService,
              policyService, userService);
    }

    async ngOnInit() {
        super.ngOnInit();
        await this.load();
    }

    addSend() {
        this.sendId = null;
        this.action = Action.Add;
    }

    editSend(send: SendView) {
        return;
    }

    async selectSend(sendId: string) {
        this.sendId = sendId;
        this.action = Action.Edit;

        if (this.addEditComponent != null) {
            this.addEditComponent.sendId = this.sendId;
            await this.addEditComponent.refresh();
        }
    }

    get selectedSendType() {
        return this.sends.find(s => s.id === this.sendId).type;
    }
}
