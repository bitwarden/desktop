import UtilsService from './utils.service';

export default class ConstantsService {
    static readonly environmentUrlsKey: string = 'environmentUrls';
    static readonly disableGaKey: string = 'disableGa';
    static readonly disableAddLoginNotificationKey: string = 'disableAddLoginNotification';
    static readonly disableContextMenuItemKey: string = 'disableContextMenuItem';
    static readonly disableFaviconKey: string = 'disableFavicon';
    static readonly disableAutoTotpCopyKey: string = 'disableAutoTotpCopy';
    static readonly enableAutoFillOnPageLoadKey: string = 'enableAutoFillOnPageLoad';
    static readonly lockOptionKey: string = 'lockOption';
    static readonly lastActiveKey: string = 'lastActive';

    // TODO: remove these instance properties once all references are reading from the static properties
    readonly environmentUrlsKey: string = 'environmentUrls';
    readonly disableGaKey: string = 'disableGa';
    readonly disableAddLoginNotificationKey: string = 'disableAddLoginNotification';
    readonly disableContextMenuItemKey: string = 'disableContextMenuItem';
    readonly disableFaviconKey: string = 'disableFavicon';
    readonly disableAutoTotpCopyKey: string = 'disableAutoTotpCopy';
    readonly enableAutoFillOnPageLoadKey: string = 'enableAutoFillOnPageLoad';
    readonly lockOptionKey: string = 'lockOption';
    readonly lastActiveKey: string = 'lastActive';

    // TODO: Convert these objects to enums
    readonly encType: any = {
        AesCbc256_B64: 0,
        AesCbc128_HmacSha256_B64: 1,
        AesCbc256_HmacSha256_B64: 2,
        Rsa2048_OaepSha256_B64: 3,
        Rsa2048_OaepSha1_B64: 4,
        Rsa2048_OaepSha256_HmacSha256_B64: 5,
        Rsa2048_OaepSha1_HmacSha256_B64: 6,
    };

    readonly cipherType: any = {
        login: 1,
        secureNote: 2,
        card: 3,
        identity: 4,
    };

    readonly fieldType: any = {
        text: 0,
        hidden: 1,
        boolean: 2,
    };

    readonly twoFactorProvider: any = {
        u2f: 4,
        yubikey: 3,
        duo: 2,
        authenticator: 0,
        email: 1,
        remember: 5,
    };

    twoFactorProviderInfo: any[];

    constructor(i18nService: any, utilsService: UtilsService) {
        if (utilsService.isEdge()) {
            // delay for i18n fetch
            setTimeout(() => {
                this.bootstrap(i18nService);
            }, 1000);
        } else {
            this.bootstrap(i18nService);
        }
    }

    private bootstrap(i18nService: any) {
        this.twoFactorProviderInfo = [
            {
                type: 0,
                name: i18nService.authenticatorAppTitle,
                description: i18nService.authenticatorAppDesc,
                active: true,
                free: true,
                displayOrder: 0,
                priority: 1,
            },
            {
                type: 3,
                name: i18nService.yubiKeyTitle,
                description: i18nService.yubiKeyDesc,
                active: true,
                displayOrder: 1,
                priority: 3,
            },
            {
                type: 2,
                name: 'Duo',
                description: i18nService.duoDesc,
                active: true,
                displayOrder: 2,
                priority: 2,
            },
            {
                type: 4,
                name: i18nService.u2fTitle,
                description: i18nService.u2fDesc,
                active: true,
                displayOrder: 3,
                priority: 4,
            },
            {
                type: 1,
                name: i18nService.emailTitle,
                description: i18nService.emailDesc,
                active: true,
                displayOrder: 4,
                priority: 0,
            },
        ];
    }
}
