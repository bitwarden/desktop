import { BrowserApi } from '../browser/browserApi';

import {
    Component,
    OnInit,
} from '@angular/core';

@Component({
    selector: 'app-private-mode',
    templateUrl: 'private-mode.component.html',
})
export class PrivateModeComponent implements OnInit {
    privateModeMessage: string;
    learnMoreMessage: string;

    ngOnInit() {
        this.privateModeMessage = chrome.i18n.getMessage('privateModeMessage');
        this.learnMoreMessage = chrome.i18n.getMessage('learnMore');
    }

    learnMore() {
        BrowserApi.createNewTab('https://help.bitwarden.com/article/extension-wont-load-in-private-mode/');
    }
}
