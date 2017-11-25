import { ValidationService } from '../services/validation.service';

export function FormDirective($rootScope: ng.IRootScopeService, validationService: ValidationService) {
    return {
        require: 'form',
        restrict: 'A',
        link: (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes,
               formCtrl: ng.IFormController) => {
            const watchPromise = attrs.bitForm || null;
            if (watchPromise) {
                scope.$watch(watchPromise, formSubmitted.bind(null, formCtrl, scope));
            }
        },
    };

    function formSubmitted(form: any, scope: ng.IScope, promise: any) {
        if (!promise || !promise.then) {
            return;
        }

        // start loading
        form.$loading = true;

        promise.then((response: any) => {
            form.$loading = false;
        }, (reason: any) => {
            form.$loading = false;
            validationService.showError(reason);
        });
    }
}
