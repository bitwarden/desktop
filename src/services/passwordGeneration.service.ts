import { CipherString } from '../models/domain/cipherString';
import PasswordHistory from '../models/domain/passwordHistory';

import ConstantsService from './constants.service';
import CryptoService from './crypto.service';
import UtilsService from './utils.service';

const DefaultOptions = {
    length: 10,
    ambiguous: false,
    number: true,
    minNumber: 1,
    uppercase: true,
    minUppercase: 1,
    lowercase: true,
    minLowercase: 1,
    special: false,
    minSpecial: 1,
};

const Keys = {
    options: 'passwordGenerationOptions',
};

const MaxPasswordsInHistory = 100;

export default class PasswordGenerationService {
    static generatePassword(options: any): string {
        // overload defaults with given options
        const o = Object.assign({}, DefaultOptions, options);

        // sanitize
        if (o.uppercase && o.minUppercase < 0) {
            o.minUppercase = 1;
        }
        if (o.lowercase && o.minLowercase < 0) {
            o.minLowercase = 1;
        }
        if (o.number && o.minNumber < 0) {
            o.minNumber = 1;
        }
        if (o.special && o.minSpecial < 0) {
            o.minSpecial = 1;
        }

        if (!o.length || o.length < 1) {
            o.length = 10;
        }

        const minLength: number = o.minUppercase + o.minLowercase + o.minNumber + o.minSpecial;
        if (o.length < minLength) {
            o.length = minLength;
        }

        const positions: string[] = [];
        if (o.lowercase && o.minLowercase > 0) {
            for (let i = 0; i < o.minLowercase; i++) {
                positions.push('l');
            }
        }
        if (o.uppercase && o.minUppercase > 0) {
            for (let i = 0; i < o.minUppercase; i++) {
                positions.push('u');
            }
        }
        if (o.number && o.minNumber > 0) {
            for (let i = 0; i < o.minNumber; i++) {
                positions.push('n');
            }
        }
        if (o.special && o.minSpecial > 0) {
            for (let i = 0; i < o.minSpecial; i++) {
                positions.push('s');
            }
        }
        while (positions.length < o.length) {
            positions.push('a');
        }

        // shuffle
        positions.sort(() => {
            return UtilsService.secureRandomNumber(0, 1) * 2 - 1;
        });

        // build out the char sets
        let allCharSet = '';

        let lowercaseCharSet = 'abcdefghijkmnopqrstuvwxyz';
        if (o.ambiguous) {
            lowercaseCharSet += 'l';
        }
        if (o.lowercase) {
            allCharSet += lowercaseCharSet;
        }

        let uppercaseCharSet = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';
        if (o.ambiguous) {
            uppercaseCharSet += 'O';
        }
        if (o.uppercase) {
            allCharSet += uppercaseCharSet;
        }

        let numberCharSet = '23456789';
        if (o.ambiguous) {
            numberCharSet += '01';
        }
        if (o.number) {
            allCharSet += numberCharSet;
        }

        const specialCharSet = '!@#$%^&*';
        if (o.special) {
            allCharSet += specialCharSet;
        }

        let password = '';
        for (let i = 0; i < o.length; i++) {
            let positionChars: string;
            switch (positions[i]) {
                case 'l':
                    positionChars = lowercaseCharSet;
                    break;
                case 'u':
                    positionChars = uppercaseCharSet;
                    break;
                case 'n':
                    positionChars = numberCharSet;
                    break;
                case 's':
                    positionChars = specialCharSet;
                    break;
                case 'a':
                    positionChars = allCharSet;
                    break;
            }

            const randomCharIndex = UtilsService.secureRandomNumber(0, positionChars.length - 1);
            password += positionChars.charAt(randomCharIndex);
        }

        return password;
    }

    optionsCache: any;
    history: PasswordHistory[];

    constructor(private cryptoService: CryptoService) {
        const self = this;

        const historyKey = ConstantsService.generatedPasswordHistoryKey;
        UtilsService.getObjFromStorage<PasswordHistory[]>(historyKey).then((encrypted) => {
            return self.decryptHistory(encrypted);
        }).then((history) => {
            self.history = history;
        });
    }

    generatePassword(options: any) {
        return PasswordGenerationService.generatePassword(options);
    }

    async getOptions() {
        if (this.optionsCache) {
            return this.optionsCache;
        }

        const options = await UtilsService.getObjFromStorage(Keys.options);
        this.optionsCache = options;
        return options;
    }

    async saveOptions(options: any) {
        await UtilsService.saveObjToStorage(Keys.options, options);
        this.optionsCache = options;
    }

    getHistory() {
        return this.history;
    }

    async addHistory(password: string) {
        // Prevent duplicates
        if (this.matchesPrevious(password)) {
            return;
        }

        this.history.push(new PasswordHistory(password, Date.now()));

        // Remove old items.
        if (this.history.length > MaxPasswordsInHistory) {
            this.history.shift();
        }

        await this.saveHistory();
    }

    clear(): Promise<any> {
        this.history = [];
        return UtilsService.removeFromStorage(ConstantsService.generatedPasswordHistoryKey);
    }

    private async saveHistory() {
        const history = await this.encryptHistory();
        return UtilsService.saveObjToStorage(ConstantsService.generatedPasswordHistoryKey, history);
    }

    private encryptHistory(): Promise<PasswordHistory[]> {
        if (this.history == null) {
            return Promise.resolve([]);
        }

        const self = this;
        const promises = self.history.map(async (item) => {
            const encrypted = await self.cryptoService.encrypt(item.password);
            return new PasswordHistory(encrypted.encryptedString, item.date);
        });

        return Promise.all(promises);
    }

    private decryptHistory(history: PasswordHistory[]): Promise<PasswordHistory[]> {
        if (history == null) {
            return Promise.resolve([]);
        }

        const self = this;
        const promises = history.map(async (item) => {
            const decrypted = await self.cryptoService.decrypt(new CipherString(item.password));
            return new PasswordHistory(decrypted, item.date);
        });

        return Promise.all(promises);
    }

    private matchesPrevious(password: string): boolean {
        if (this.history == null) {
            return false;
        }

        const len = this.history.length;
        return len !== 0 && this.history[len - 1].password === password;
    }
}
