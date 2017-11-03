import TokenService from './token.service';
import UtilsService from './utils.service';

const Keys = {
    userId: 'userId',
    userEmail: 'userEmail',
    stamp: 'securityStamp',
};

export default class UserService {
    userId: string;
    email: string;
    stamp: string;

    constructor(private tokenService: TokenService) {
    }

    setUserIdAndEmail(userId: string, email: string): Promise<any> {
        this.email = email;
        this.userId = userId;

        return Promise.all([
            UtilsService.saveObjToStorage(Keys.userEmail, email),
            UtilsService.saveObjToStorage(Keys.userId, userId),
        ]);
    }

    setSecurityStamp(stamp: string): Promise<any> {
        this.stamp = stamp;
        return UtilsService.saveObjToStorage(Keys.stamp, stamp);
    }

    async getUserId(): Promise<string> {
        if (this.userId != null) {
            return this.userId;
        }

        this.userId = await UtilsService.getObjFromStorage<string>(Keys.userId);
        return this.userId;
    }

    async getEmail(): Promise<string> {
        if (this.email != null) {
            return this.email;
        }

        this.email = await UtilsService.getObjFromStorage<string>(Keys.userEmail);
        return this.email;
    }

    async getSecurityStamp(): Promise<string> {
        if (this.stamp != null) {
            return this.stamp;
        }

        this.stamp = await UtilsService.getObjFromStorage<string>(Keys.stamp);
        return this.stamp;
    }

    async clear(): Promise<any> {
        await Promise.all([
            UtilsService.removeFromStorage(Keys.userId),
            UtilsService.removeFromStorage(Keys.userEmail),
            UtilsService.removeFromStorage(Keys.stamp),
        ]);

        this.userId = this.email = this.stamp = null;
    }

    async isAuthenticated(): Promise<boolean> {
        const token = await this.tokenService.getToken();
        if (token == null) {
            return false;
        }

        const userId = await this.getUserId();
        return userId != null;
    }
}
