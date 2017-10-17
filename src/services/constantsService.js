function ConstantsService(i18nService) {
    return {
        environmentUrlsKey: 'environmentUrls',
        disableGaKey: 'disableGa',
        disableAddLoginNotificationKey: 'disableAddLoginNotification',
        disableContextMenuItemKey: 'disableContextMenuItem',
        disableFaviconKey: 'disableFavicon',
        disableAutoTotpCopyKey: 'disableAutoTotpCopy',
        enableAutoFillOnPageLoadKey: 'enableAutoFillOnPageLoad',
        lockOptionKey: 'lockOption',
        lastActiveKey: 'lastActive',
        generatedPasswordHistory: 'generatedPasswordHistory',
        encType: {
            AesCbc256_B64: 0,
            AesCbc128_HmacSha256_B64: 1,
            AesCbc256_HmacSha256_B64: 2,
            Rsa2048_OaepSha256_B64: 3,
            Rsa2048_OaepSha1_B64: 4,
            Rsa2048_OaepSha256_HmacSha256_B64: 5,
            Rsa2048_OaepSha1_HmacSha256_B64: 6
        },
        cipherType: {
            login: 1,
            secureNote: 2,
            card: 3,
            identity: 4
        },
        fieldType: {
            text: 0,
            hidden: 1,
            boolean: 2
        },
        twoFactorProvider: {
            u2f: 4,
            yubikey: 3,
            duo: 2,
            authenticator: 0,
            email: 1,
            remember: 5
        },
        twoFactorProviderInfo: [
            {
                type: 0,
                name: i18nService.authenticatorAppTitle,
                description: i18nService.authenticatorAppDesc,
                active: true,
                free: true,
                displayOrder: 0,
                priority: 1
            },
            {
                type: 3,
                name: i18nService.yubiKeyTitle,
                description: i18nService.yubiKeyDesc,
                active: true,
                displayOrder: 1,
                priority: 3
            },
            {
                type: 2,
                name: 'Duo',
                description: i18nService.duoDesc,
                active: true,
                displayOrder: 2,
                priority: 2
            },
            {
                type: 4,
                name: i18nService.u2fTitle,
                description: i18nService.u2fDesc,
                active: true,
                displayOrder: 3,
                priority: 4
            },
            {
                type: 1,
                name: i18nService.emailTitle,
                description: i18nService.emailDesc,
                active: true,
                displayOrder: 4,
                priority: 0
            }
        ]
    };
}
