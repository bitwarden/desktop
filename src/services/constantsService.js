function ConstantsService() {
    return {
        disableGaKey: 'disableGa',
        disableAddLoginNotificationKey: 'disableAddLoginNotification',
        disableContextMenuItemKey: 'disableContextMenuItem',
        lockOptionKey: 'lockOption',
        lastActiveKey: 'lastActive',
        encType: {
            AesCbc256_B64: 0,
            AesCbc128_HmacSha256_B64: 1,
            AesCbc256_HmacSha256_B64: 2,
            Rsa2048_OaepSha256_B64: 3,
            Rsa2048_OaepSha1_B64: 4,
            Rsa2048_OaepSha256_HmacSha256_B64: 5,
            Rsa2048_OaepSha1_HmacSha256_B64: 6
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
                name: 'Authenticator App',
                description: 'Use an authenticator app (such as Authy or Google Authenticator) to generate time-based ' +
                'verification codes.',
                active: true,
                free: true,
                displayOrder: 0,
                priority: 1
            },
            {
                type: 3,
                name: 'YubiKey OTP Security Key',
                description: 'Use a YubiKey to access your account. Works with YubiKey 4, 4 Nano, 4C, and NEO devices.',
                active: true,
                displayOrder: 1,
                priority: 3
            },
            {
                type: 2,
                name: 'Duo',
                description: 'Verify with Duo Security using the Duo Mobile app, SMS, phone call, or U2F security key.',
                active: true,
                displayOrder: 2,
                priority: 2
            },
            {
                type: 4,
                name: 'FIDO U2F Security Key',
                description: 'Use any FIDO U2F enabled security key to access your account.',
                active: true,
                displayOrder: 3,
                priority: 4
            },
            {
                type: 1,
                name: 'Email',
                description: 'Verification codes will be emailed to you.',
                active: true,
                displayOrder: 4,
                priority: 0
            }
        ]
    };
}
