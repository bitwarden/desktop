import { Abstractions } from '@bitwarden/jslib';

export default class ContainerService {
    constructor(private cryptoService: Abstractions.CryptoService,
        private platformUtilsService: Abstractions.PlatformUtilsService) {
    }

    attachToWindow(win: any) {
        if (!win.BitwardenContainerService) {
            win.BitwardenContainerService = this;
        }
    }

    getCryptoService(): Abstractions.CryptoService {
        return this.cryptoService;
    }

    getPlatformUtilsService(): Abstractions.PlatformUtilsService {
        return this.platformUtilsService;
    }
}
