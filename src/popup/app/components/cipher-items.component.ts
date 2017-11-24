import * as template from './cipher-items.component.html';

export class CipherItemsController implements ng.IController {
    onSelected: Function;
    onView: Function;

    i18n: any;

    constructor(private i18nService: any) {
        this.i18n = i18nService;
    }

    view(cipher: any) {
        return this.onView({cipher});
    }

    select(cipher: any) {
        return this.onSelected({cipher});
    }
}

export const CipherItemsComponent = {
    bindings: {
        ciphers: '<',
        selectionTitle: '<',
        onSelected: '&',
        onView: '&',
    },
    controller: CipherItemsController,
    template,
};
