import { LoginData } from '../data/loginData';

import { CipherString } from './cipherString';
import Domain from './domain';

class Login extends Domain {
    uri: CipherString;
    username: CipherString;
    password: CipherString;
    totp: CipherString;

    constructor(obj?: LoginData, alreadyEncrypted: boolean = false) {
        super();
        if (obj == null) {
            return;
        }

        this.buildDomainModel(this, obj, {
            uri: null,
            username: null,
            password: null,
            totp: null,
        }, alreadyEncrypted, []);
    }

    decrypt(orgId: string): Promise<any> {
        return this.decryptObj({}, {
            uri: null,
            username: null,
            password: null,
            totp: null,
        }, orgId);
    }
}

export { Login };
(window as any).Login = Login;
