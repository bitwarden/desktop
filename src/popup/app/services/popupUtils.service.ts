export default class PopupUtilsService {
    static initListSectionItemListeners(doc: Document, angular: any): void {
        if (!doc) {
            throw new Error('doc parameter required');
        }

        const sectionItems = doc.querySelectorAll(
            '.list-section-item:not([data-bw-events="1"])');
        const sectionFormItems = doc.querySelectorAll(
            '.list-section-item:not([data-bw-events="1"]) input, ' +
            '.list-section-item:not([data-bw-events="1"]) select, ' +
            '.list-section-item:not([data-bw-events="1"]) textarea');

        sectionItems.forEach((item) => {
            (item as HTMLElement).dataset.bwEvents = '1';

            item.addEventListener('click', (e) => {
                if (e.defaultPrevented) {
                    return;
                }

                const el = e.target as HTMLElement;

                // Some elements will already focus properly
                if (el.tagName != null) {
                    switch (el.tagName.toLowerCase()) {
                        case 'label': case 'input': case 'textarea': case 'select':
                            return;
                        default:
                            break;
                    }
                }

                const cell = el.closest('.list-section-item');
                if (!cell) {
                    return;
                }

                const textFilter = 'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"])';
                const text = cell.querySelectorAll(textFilter + ', textarea');
                const checkbox = cell.querySelectorAll('input[type="checkbox"]');
                const select = cell.querySelectorAll('select');

                if (text.length > 0) {
                    (text[0] as HTMLElement).focus();
                } else if (select.length > 0) {
                    (select[0] as HTMLElement).focus();
                } else if (checkbox.length > 0) {
                    const cb = checkbox[0] as HTMLInputElement;
                    cb.checked = !cb.checked;
                    if (angular) {
                        angular.element(checkbox[0]).triggerHandler('click');
                    }
                }
            }, false);
        });

        sectionFormItems.forEach((item) => {
            const itemCell = item.closest('.list-section-item');
            (itemCell as HTMLElement).dataset.bwEvents = '1';

            item.addEventListener('focus', (e: Event) => {
                const el = e.target as HTMLElement;
                const cell = el.closest('.list-section-item');
                if (!cell) {
                    return;
                }

                cell.classList.add('active');
            }, false);

            item.addEventListener('blur', (e: Event) => {
                const el = e.target as HTMLElement;
                const cell = el.closest('.list-section-item');
                if (!cell) {
                    return;
                }

                cell.classList.remove('active');
            }, false);
        });
    }

    initListSectionItemListeners(doc: Document, angular: any): void {
        PopupUtilsService.initListSectionItemListeners(doc, angular);
    }
}
