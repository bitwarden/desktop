import { Abstractions } from '@bitwarden/jslib';

import { CryptoService } from './abstractions/crypto.service';

export default class ContainerService {
    constructor(private cryptoService: CryptoService,
        private platformUtilsService: Abstractions.PlatformUtilsService) {
    }

    attachToWindow(win: any) {
        if (!win.BitwardenContainerService) {
            win.BitwardenContainerService = this;
        }
    }

    getCryptoService(): CryptoService {
        return this.cryptoService;
    }

    getPlatformUtilsService(): Abstractions.PlatformUtilsService {
        return this.platformUtilsService;
    }
}
