import {
    Pipe,
    PipeTransform,
} from '@angular/core';

import { I18nService } from '../../services/i18n.service';

@Pipe({
    name: 'i18n',
})
export class I18nPipe implements PipeTransform {
    constructor(private i18nService: I18nService) {
    }

    transform(id: string): string {
        return this.i18nService.t(id);
    }
}
