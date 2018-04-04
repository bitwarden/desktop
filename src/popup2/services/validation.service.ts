import { Injectable } from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { I18nService } from 'jslib/abstractions/i18n.service';

@Injectable()
export class ValidationService {
    constructor(private toasterService: ToasterService, private i18nService: I18nService) { }

    showError(data: any): string[] {
        const defaultErrorMessage = this.i18nService.t('unexpectedError');
        const errors: string[] = [];

        if (data == null || typeof data !== 'object') {
            errors.push(defaultErrorMessage);
        } else if (data.validationErrors == null) {
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

        if (errors.length > 0) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'), errors[0]);
        }

        return errors;
    }
}
