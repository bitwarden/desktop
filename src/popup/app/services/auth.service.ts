import { DeviceRequest } from '../../../models/request/deviceRequest';
import { TokenRequest } from '../../../models/request/tokenRequest';

class AuthService {

    constructor(public cryptoService: any, public apiService: any, public userService: any, public tokenService: any,
                public $rootScope: any,  public appIdService: any, public utilsService: any,
                public constantsService: any) {

    }

    async logIn(email: string, masterPassword: string, twoFactorProvider?: number,
                twoFactorToken?: string, remember?: boolean) {
        email = email.toLowerCase();

        const key = this.cryptoService.makeKey(masterPassword, email);
        const appId = await this.appIdService.getAppId();
        const storedTwoFactorToken = await this.tokenService.getTwoFactorToken(email);
        const hashedPassword = await this.cryptoService.hashPassword(masterPassword, key);

        const deviceRequest = new DeviceRequest(appId, this.utilsService);

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
        await this.setUserIdAndEmail(this.tokenService.getUserId(), this.tokenService.getEmail());
        await this.cryptoService.setEncKey(response.key);
        await this.cryptoService.setEncPrivateKey(response.privateKey);

        chrome.runtime.sendMessage({ command: 'loggedIn' });
        return {
            twoFactor: false,
            twoFactorProviders: null,
        };
    }

    setUserIdAndEmail(userId: any, email: any) {
        return new Promise((resolve) => {
            return this.userService.setUserIdAndEmail(userId, email, resolve);
        });
    }

    logOut(callback: Function) {
        this.$rootScope.vaultCiphers = null;
        this.$rootScope.vaultFolders = null;
        callback();
    }
}

export default AuthService;
