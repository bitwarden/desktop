import { DeviceRequest } from 'jslib/models/request/deviceRequest';
import { TokenRequest } from 'jslib/models/request/tokenRequest';

import { ConstantsService } from 'jslib/services/constants.service';

import { ApiService } from 'jslib/abstractions/api.service';
import { AppIdService } from 'jslib/abstractions/appId.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { UserService } from 'jslib/abstractions/user.service';

export class AuthService {
    constructor(public cryptoService: CryptoService, public apiService: ApiService, public userService: UserService,
        public tokenService: TokenService, public $rootScope: any, public appIdService: AppIdService,
        public platformUtilsService: PlatformUtilsService, public constantsService: ConstantsService,
        public messagingService: MessagingService) {
    }

    async logIn(email: string, masterPassword: string, twoFactorProvider?: number,
        twoFactorToken?: string, remember?: boolean) {
        email = email.toLowerCase();

        const key = this.cryptoService.makeKey(masterPassword, email);
        const appId = await this.appIdService.getAppId();
        const storedTwoFactorToken = await this.tokenService.getTwoFactorToken(email);
        const hashedPassword = await this.cryptoService.hashPassword(masterPassword, key);

        const deviceRequest = new DeviceRequest(appId, this.platformUtilsService);

        let request: TokenRequest;

        if (twoFactorToken != null && twoFactorProvider != null) {
            request = new TokenRequest(email, hashedPassword, twoFactorProvider, twoFactorToken, remember,
                deviceRequest);
        } else if (storedTwoFactorToken) {
            request = new TokenRequest(email, hashedPassword, this.constantsService.twoFactorProvider.remember,
                storedTwoFactorToken, false, deviceRequest);
        } else {
            request = new TokenRequest(email, hashedPassword, null, null, false, deviceRequest);
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

AuthService.$inject = ['cryptoService', 'apiService', 'userService', 'tokenService', '$rootScope', 'appIdService',
    'platformUtilsService', 'constantsService', 'messagingService'];
