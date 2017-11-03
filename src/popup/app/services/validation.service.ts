import * as angular from 'angular';

class ValidationService {

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
            for (const error of data.validationErrors) {
                error.forEach((item: string) => {
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

export default ValidationService;
