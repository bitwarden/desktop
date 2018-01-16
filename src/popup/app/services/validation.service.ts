import * as angular from 'angular';

export class ValidationService {
    constructor(private toastr: any, private i18nService: any) {
    }

    showError(data: any) {
        const defaultErrorMessage = this.i18nService.unexpectedError;
        const errors: string[] = [];

        if (!data || !angular.isObject(data)) {
            errors.push(defaultErrorMessage);
        } else if (!data.validationErrors) {
            errors.push(data.message ? data.message : defaultErrorMessage);
        } else {
            for (const key in data.validationErrors) {
                if (!data.validationErrors.hasOwnProperty(key)) {
                    continue;
                }

                data.validationErrors[key].forEach((item: string) => {
                    errors.push(item);
                });
            }
        }

        if (errors.length) {
            this.toastr.error(errors[0], this.i18nService.errorsOccurred);
        }

        return errors;
    }

}

ValidationService.$inject = ['toastr', 'i18nService'];
