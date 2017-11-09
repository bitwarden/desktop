import * as angular from 'angular';
import * as template from './password-generator.component.html';

export class PasswordGeneratorController {
    $transition$: any;
    options: any;
    showSelect: any;
    password: string = '-';
    editState: any;
    addState: any;
    i18n: any;

    constructor(private $state: any, private passwordGenerationService: any,
                private toastr: any, utilsService: any, private $analytics: any,
                private i18nService: any) {
        this.i18n = i18nService;

        utilsService.initListSectionItemListeners($(document), angular);

        passwordGenerationService.getOptions().then((options: any) => {
            this.options = options;
            this.regenerate(false);
            $analytics.eventTrack('Generated Password');
            passwordGenerationService.addHistory(this.password);
        });

        // Save password once the slider stop moving.
        document.querySelector('#length').addEventListener('change', (e) => {
            e.preventDefault();

            $analytics.eventTrack('Generated Password');
            this.saveOptions(this.options, false);
            passwordGenerationService.addHistory(this.password);
        });
    }

    $onInit() {
        const params = this.$transition$.params('to');
        this.addState = params.addState;
        this.editState = params.editState;

        this.showSelect = this.addState || this.editState;
    }

    sliderMoved() {
        this.regenerate(false);
    }

    regenerate(trackEvent: any) {
        this.password = this.passwordGenerationService.generatePassword(this.options);

        if (trackEvent) {
            this.$analytics.eventTrack('Regenerated Password');
            this.passwordGenerationService.addHistory(this.password);
        }
    }

    saveOptions(options: any, regenerate: boolean = true) {
        if (!options.uppercase && !options.lowercase && !options.number && !options.special) {
            options.lowercase = this.options.lowercase = true;
        }
        if (!options.minNumber) {
            options.minNumber = this.options.minNumber = 0;
        }
        if (!options.minSpecial) {
            options.minSpecial = this.options.minSpecial = 0;
        }

        this.passwordGenerationService.saveOptions(options);
        if (regenerate) {
            this.regenerate(false);
        }
        return true;
    }

    clipboardError(e: any, password: any) {
        this.toastr.info(this.i18nService.browserNotSupportClipboard);
    }

    clipboardSuccess(e: any) {
        this.$analytics.eventTrack('Copied Generated Password');
        e.clearSelection();
        this.toastr.info(this.i18nService.passwordCopied);
    }

    close() {
        this.dismiss();
    }

    select() {
        this.$analytics.eventTrack('Selected Generated Password');

        if (this.addState) {
            this.addState.cipher.login.password = this.password;
        } else if (this.editState) {
            this.editState.cipher.login.password = this.password;
        }

        this.dismiss();
    }

    goHistory() {
        this.$state.go('^.passwordGeneratorHistory', {
            animation: 'in-slide-left',
            addState: this.addState,
            editState: this.editState,
        });
    }

    private dismiss() {
        if (this.addState) {
            this.$state.go('addCipher', {
                animation: 'out-slide-down',
                from: this.addState.from,
                cipher: this.addState.cipher,
            });
        } else if (this.editState) {
            this.$state.go('editCipher', {
                animation: 'out-slide-down',
                cipher: this.editState.cipher,
                fromView: this.editState.fromView,
                cipherId: this.editState.cipherId,
                from: this.editState.from,
            });
        } else {
            this.$state.go('tabs.tools', {
                animation: 'out-slide-down',
            });
        }
    }
}

export const PasswordGeneratorComponent = {
    bindings: {
        $transition$: '<',
    },
    controller: PasswordGeneratorController,
    template,
};
