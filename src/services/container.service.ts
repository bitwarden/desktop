import {
    CryptoService,
    PlatformUtilsService,
} from 'jslib/abstractions';

export default class ContainerService {
    constructor(private cryptoService: CryptoService,
        private platformUtilsService: PlatformUtilsService) {
    }

    attachToWindow(win: any) {
        if (!win.BitwardenContainerService) {
            win.BitwardenContainerService = this;
        }
    }

    getCryptoService(): CryptoService {
        return this.cryptoService;
    }

    getPlatformUtilsService(): PlatformUtilsService {
        return this.platformUtilsService;
    }
}
