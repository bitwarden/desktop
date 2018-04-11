import * as template from './password-generator-history.component.html';

import { PasswordHistory } from 'jslib/models/domain/passwordHistory';

import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';

export class PasswordGeneratorHistoryController {
    $transition$: any;
    history: PasswordHistory[];
    editState: any;
    addState: any;
    i18n: any;
    loaded: boolean = false;

    constructor(private $state: any, private passwordGenerationService: PasswordGenerationService,
        private toastr: any, private $analytics: any, private i18nService: any) {
        this.i18n = i18nService;

        passwordGenerationService.getHistory().then((history) => {
            this.history = history;
            this.loaded = true;
        });
    }

    $onInit() {
        const params = this.$transition$.params('to');
        this.addState = params.addState;
        this.editState = params.editState;
    }

    clear() {
        this.history = [];
        this.passwordGenerationService.clear();
    }

    clipboardError(e: any, password: any) {
        this.toastr.info(this.i18nService.browserNotSupportClipboard);
    }

    clipboardSuccess(e: any) {
        this.$analytics.eventTrack('Copied Historical Password');
        e.clearSelection();
        this.toastr.info(this.i18nService.passwordCopied);
    }

    close() {
        this.$state.go('^.passwordGenerator', {
            animation: 'out-slide-right',
            addState: this.addState,
            editState: this.editState,
        });
    }
}

PasswordGeneratorHistoryController.$inject = ['$state', 'passwordGenerationService', 'toastr', '$analytics',
    'i18nService'];

export const PasswordGeneratorHistoryComponent = {
    bindings: {
        $transition$: '<',
    },
    controller: PasswordGeneratorHistoryController,
    template: template,
};
