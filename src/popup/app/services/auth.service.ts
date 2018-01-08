import { Abstractions, Request } from '@bitwarden/jslib';

class AuthService {
    constructor(public cryptoService: Abstractions.CryptoService, public apiService: any, public userService: any,
        public tokenService: any, public $rootScope: any, public appIdService: any,
        public platformUtilsService: Abstractions.PlatformUtilsService, public constantsService: any,
        public messagingService: Abstractions.MessagingService) {
    }

    async logIn(email: string, masterPassword: string, twoFactorProvider?: number,
                twoFactorToken?: string, remember?: boolean) {
        email = email.toLowerCase();

        const key = this.cryptoService.makeKey(masterPassword, email);
        const appId = await this.appIdService.getAppId();
        const storedTwoFactorToken = await this.tokenService.getTwoFactorToken(email);
        const hashedPassword = await this.cryptoService.hashPassword(masterPassword, key);

        const deviceRequest = new Request.Device(appId, this.platformUtilsService);

        let request: Request.Token;

        if (twoFactorToken != null && twoFactorProvider != null) {
            request = new Request.Token(email, hashedPassword, twoFactorProvider, twoFactorToken, remember,
                deviceRequest);
        } else if (storedTwoFactorToken) {
            request = new Request.Token(email, hashedPassword, this.constantsService.twoFactorProvider.remember,
                storedTwoFactorToken, false, deviceRequest);
        } else {
            request = new Request.Token(email, hashedPassword, null, null, false, deviceRequest);
        }

        const response = await this.apiService.postIdentityToken(request);
        if (!response) {
            return;
        }

        if (!response.accessToken) {
            // two factor required
            return {
                twoFactor: true,
                twoFactorProviders: response,
            };
        }

        if (response.twoFactorToken) {
            this.tokenService.setTwoFactorToken(response.twoFactorToken, email);
        }

        await this.tokenService.setTokens(response.accessToken, response.refreshToken);
        await this.cryptoService.setKey(key);
        await this.cryptoService.setKeyHash(hashedPassword);
        await this.userService.setUserIdAndEmail(this.tokenService.getUserId(), this.tokenService.getEmail());
        await this.cryptoService.setEncKey(response.key);
        await this.cryptoService.setEncPrivateKey(response.privateKey);

        this.messagingService.send('loggedIn');
        return {
            twoFactor: false,
            twoFactorProviders: null,
        };
    }

    logOut(callback: Function) {
        this.$rootScope.vaultCiphers = null;
        this.$rootScope.vaultFolders = null;
        this.$rootScope.vaultCollections = null;
        callback();
    }
}

export default AuthService;
