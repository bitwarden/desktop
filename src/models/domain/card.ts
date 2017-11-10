import { CardData } from '../data/cardData';

import { CipherString } from './cipherString';
import Domain from './domain';

class Card extends Domain {
    cardholderName: CipherString;
    brand: CipherString;
    number: CipherString;
    expMonth: CipherString;
    expYear: CipherString;
    code: CipherString;

    constructor(obj?: CardData, alreadyEncrypted: boolean = false) {
        super();
        if (obj == null) {
            return;
        }

        this.buildDomainModel(this, obj, {
            cardholderName: null,
            brand: null,
            number: null,
            expMonth: null,
            expYear: null,
            code: null,
        }, alreadyEncrypted, []);
    }

    decrypt(orgId: string): Promise<any> {
        return this.decryptObj({}, {
            cardholderName: null,
            brand: null,
            number: null,
            expMonth: null,
            expYear: null,
            code: null,
        }, orgId);
    }
}

export { Card };
(window as any).Card = Card;
