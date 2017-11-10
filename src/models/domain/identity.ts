import { IdentityData } from '../data/identityData';

import { CipherString } from './cipherString';
import Domain from './domain';

class Identity extends Domain {
    title: CipherString;
    firstName: CipherString;
    middleName: CipherString;
    lastName: CipherString;
    address1: CipherString;
    address2: CipherString;
    address3: CipherString;
    city: CipherString;
    state: CipherString;
    postalCode: CipherString;
    country: CipherString;
    company: CipherString;
    email: CipherString;
    phone: CipherString;
    ssn: CipherString;
    username: CipherString;
    passportNumber: CipherString;
    licenseNumber: CipherString;

    constructor(obj?: IdentityData, alreadyEncrypted: boolean = false) {
        super();
        if (obj == null) {
            return;
        }

        this.buildDomainModel(this, obj, {
            title: null,
            firstName: null,
            middleName: null,
            lastName: null,
            address1: null,
            address2: null,
            address3: null,
            city: null,
            state: null,
            postalCode: null,
            country: null,
            company: null,
            email: null,
            phone: null,
            ssn: null,
            username: null,
            passportNumber: null,
            licenseNumber: null,
        }, alreadyEncrypted, []);
    }

    decrypt(orgId: string): Promise<any> {
        return this.decryptObj({}, {
            title: null,
            firstName: null,
            middleName: null,
            lastName: null,
            address1: null,
            address2: null,
            address3: null,
            city: null,
            state: null,
            postalCode: null,
            country: null,
            company: null,
            email: null,
            phone: null,
            ssn: null,
            username: null,
            passportNumber: null,
            licenseNumber: null,
        }, orgId);
    }
}

export { Identity };
(window as any).Identity = Identity;
