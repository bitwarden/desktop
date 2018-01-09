import TokenService from './token.service';

import { StorageService } from 'jslib/abstractions';

const Keys = {
    userId: 'userId',
    userEmail: 'userEmail',
    stamp: 'securityStamp',
};

export default class UserService {
    userId: string;
    email: string;
    stamp: string;

    constructor(private tokenService: TokenService, private storageService: StorageService) {
    }

    setUserIdAndEmail(userId: string, email: string): Promise<any> {
        this.email = email;
        this.userId = userId;

        return Promise.all([
            this.storageService.save(Keys.userEmail, email),
            this.storageService.save(Keys.userId, userId),
        ]);
    }

    setSecurityStamp(stamp: string): Promise<any> {
        this.stamp = stamp;
        return this.storageService.save(Keys.stamp, stamp);
    }

    async getUserId(): Promise<string> {
        if (this.userId != null) {
            return this.userId;
        }

        this.userId = await this.storageService.get<string>(Keys.userId);
        return this.userId;
    }

    async getEmail(): Promise<string> {
        if (this.email != null) {
            return this.email;
        }

        this.email = await this.storageService.get<string>(Keys.userEmail);
        return this.email;
    }

    async getSecurityStamp(): Promise<string> {
        if (this.stamp != null) {
            return this.stamp;
        }

        this.stamp = await this.storageService.get<string>(Keys.stamp);
        return this.stamp;
    }

    async clear(): Promise<any> {
        await Promise.all([
            this.storageService.remove(Keys.userId),
            this.storageService.remove(Keys.userEmail),
            this.storageService.remove(Keys.stamp),
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
