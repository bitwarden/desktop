import { DatePipe } from '@angular/common';

import { Component } from '@angular/core';

import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { PolicyService } from 'jslib/abstractions/policy.service';
import { SendService } from 'jslib/abstractions/send.service';
import { UserService } from 'jslib/abstractions/user.service';

import { AddEditComponent as BaseAddEditComponent } from 'jslib/angular/components/send/add-edit.component';

@Component({
    selector: 'app-send-add-edit',
    templateUrl: 'add-edit.component.html',
})
export class AddEditComponent extends BaseAddEditComponent {
    constructor(i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        environmentService: EnvironmentService, datePipe: DatePipe,
        sendService: SendService, userService: UserService,
        messagingService: MessagingService, policyService: PolicyService) {
        super(i18nService, platformUtilsService, environmentService,
              datePipe, sendService, userService, messagingService, policyService);
    }

    async refresh() {
        this.password = null;
        const send = await this.loadSend();
        this.send = await send.decrypt();
        this.hasPassword = this.send.password != null && this.send.password.trim() !== '';
        this.deletionDate = this.dateToString(this.send.deletionDate);
        this.expirationDate = this.dateToString(this.send.expirationDate);
    }

    cancel() {
        this.onCancelled.emit(this.send);
    }

    copyLinkToClipboard(link: string) {
        super.copyLinkToClipboard(link);
        this.platformUtilsService.showToast('success', null,
            this.i18nService.t('valueCopied', this.i18nService.t('sendLink')));
    }
}
