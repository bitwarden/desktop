import { CipherService } from 'jslib/abstractions/cipher.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { SearchService } from 'jslib/services/search.service';

export class PopupSearchService extends SearchService {
    constructor(private mainSearchService: SearchService, cipherService: CipherService,
        platformUtilsService: PlatformUtilsService) {
        super(cipherService, platformUtilsService);
    }

    clearIndex() {
        throw new Error('Not available.');
    }

    indexCiphers(): Promise<void> {
        throw new Error('Not available.');
    }

    getIndexForSearch() {
        return this.mainSearchService.getIndexForSearch();
    }
}
