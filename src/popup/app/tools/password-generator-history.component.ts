import * as template from './password-generator-history.component.html';

import PasswordHistory from '../../../models/domain/passwordHistory';

export class PasswordGeneratorHistoryController {
    $transition$: any;
    history: PasswordHistory[];
    editState: any;
    addState: any;
    i18n: any;

    constructor(private $state: any, private passwordGenerationService: any, private toastr: any,
        private $analytics: any, private i18nService: any) {
        this.i18n = i18nService;
        this.history = passwordGenerationService.getHistory();
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

export const PasswordGeneratorHistoryComponent = {
    bindings: {
        $transition$: '<',
    },
    controller: PasswordGeneratorHistoryController,
    template: template,
};
