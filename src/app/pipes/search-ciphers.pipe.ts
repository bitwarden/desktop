import {
    Pipe,
    PipeTransform,
} from '@angular/core';

import { CipherView } from 'jslib/models/view/cipherView';

@Pipe({
    name: 'searchCiphers',
})
export class SearchCiphersPipe implements PipeTransform {
    transform(ciphers: CipherView[], searchText: string): CipherView[] {
        if (ciphers == null || ciphers.length === 0) {
            return [];
        }

        if (searchText == null || searchText.length < 2) {
            return ciphers;
        }

        searchText = searchText.toLowerCase();
        return ciphers.filter((c) => {
            if (c.name != null && c.name.toLowerCase().indexOf(searchText) > -1) {
                return true;
            }
            if (c.subTitle != null && c.subTitle.toLowerCase().indexOf(searchText) > -1) {
                return true;
            }
            if (c.login && c.login.uri != null && c.login.uri.toLowerCase().indexOf(searchText) > -1) {
                return true;
            }

            return false;
        });
    }
}
