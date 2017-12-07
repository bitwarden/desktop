import CipherService from './cipher.service';
import CollectionService from './collection.service';
import ConstantsService from './constants.service';
import CryptoService from './crypto.service';
import FolderService from './folder.service';
import UtilsService from './utils.service';

export default class LockService {
    constructor(private cipherService: CipherService, private folderService: FolderService,
        private collectionService: CollectionService, private cryptoService: CryptoService,
        private utilsService: UtilsService, private setIcon: Function, private refreshBadgeAndMenu: Function) {
        this.checkLock();
        setInterval(() => this.checkLock(), 10 * 1000); // check every 10 seconds

        const self = this;
        if ((window as any).chrome.idle && (window as any).chrome.idle.onStateChanged) {
            (window as any).chrome.idle.onStateChanged.addListener(async (newState: string) => {
                if (newState === 'locked') {
                    const lockOption = await UtilsService.getObjFromStorage<number>(ConstantsService.lockOptionKey);
                    if (lockOption === -2) {
                        self.lock();
                    }
                }
            });
        }
    }

    async checkLock(): Promise<void> {
        const popupOpen = chrome.extension.getViews({ type: 'popup' }).length > 0;
        const tabOpen = chrome.extension.getViews({ type: 'tab' }).length > 0;
        const sidebarView = this.sidebarViewName();
        const sidebarOpen = sidebarView != null && chrome.extension.getViews({ type: sidebarView }).length > 0;

        if (popupOpen || tabOpen || sidebarOpen) {
            // Do not lock
            return;
        }

        const key = await this.cryptoService.getKey();
        if (key == null) {
            // no key so no need to lock
            return;
        }

        const lockOption = await UtilsService.getObjFromStorage<number>(ConstantsService.lockOptionKey);
        if (lockOption == null || lockOption < 0) {
            return;
        }

        const lastActive = await UtilsService.getObjFromStorage<number>(ConstantsService.lastActiveKey);
        if (lastActive == null) {
            return;
        }

        const lockOptionSeconds = lockOption * 60;
        const diffSeconds = ((new Date()).getTime() - lastActive) / 1000;
        if (diffSeconds >= lockOptionSeconds) {
            // need to lock now
            await this.lock();
        }
    }

    async lock(): Promise<void> {
        await Promise.all([
            this.cryptoService.clearKey(),
            this.cryptoService.clearOrgKeys(true),
            this.cryptoService.clearPrivateKey(true),
            this.cryptoService.clearEncKey(true),
            this.setIcon(),
            this.refreshBadgeAndMenu(),
        ]);

        this.folderService.clearCache();
        this.cipherService.clearCache();
        this.collectionService.clearCache();
    }

    // Helpers

    private sidebarViewName(): string {
        if ((window as any).chrome.sidebarAction && this.utilsService.isFirefox()) {
            return 'sidebar';
        } else if (this.utilsService.isOpera() && (typeof opr !== 'undefined') && opr.sidebarAction) {
            return 'sidebar_panel';
        }

        return null;
    }
}
