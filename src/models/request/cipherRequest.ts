import { CipherType } from '../../enums/cipherType.enum';

class CipherRequest {
    type: CipherType;
    folderId: string;
    organizationId: string;
    name: string;
    notes: string;
    favorite: boolean;
    login: any;
    secureNote: any;
    card: any;
    identity: any;
    fields: any[];

    constructor(cipher: any) {
        this.type = cipher.type;
        this.folderId = cipher.folderId;
        this.organizationId = cipher.organizationId;
        this.name = cipher.name ? cipher.name.encryptedString : null;
        this.notes = cipher.notes ? cipher.notes.encryptedString : null;
        this.favorite = cipher.favorite;

        switch (this.type) {
            case CipherType.Login:
                this.login = {
                    uri: cipher.login.uri ? cipher.login.uri.encryptedString : null,
                    username: cipher.login.username ? cipher.login.username.encryptedString : null,
                    password: cipher.login.password ? cipher.login.password.encryptedString : null,
                    totp: cipher.login.totp ? cipher.login.totp.encryptedString : null,
                };
                break;
            case CipherType.SecureNote:
                this.secureNote = {
                    type: cipher.secureNote.type,
                };
                break;
            case CipherType.Card:
                this.card = {
                    cardholderName: cipher.card.cardholderName ? cipher.card.cardholderName.encryptedString : null,
                    brand: cipher.card.brand ? cipher.card.brand.encryptedString : null,
                    number: cipher.card.number ? cipher.card.number.encryptedString : null,
                    expMonth: cipher.card.expMonth ? cipher.card.expMonth.encryptedString : null,
                    expYear: cipher.card.expYear ? cipher.card.expYear.encryptedString : null,
                    code: cipher.card.code ? cipher.card.code.encryptedString : null,
                };
                break;
            case CipherType.Identity:
                this.identity = {
                    title: cipher.identity.title ? cipher.identity.title.encryptedString : null,
                    firstName: cipher.identity.firstName ? cipher.identity.firstName.encryptedString : null,
                    middleName: cipher.identity.middleName ? cipher.identity.middleName.encryptedString : null,
                    lastName: cipher.identity.lastName ? cipher.identity.lastName.encryptedString : null,
                    address1: cipher.identity.address1 ? cipher.identity.address1.encryptedString : null,
                    address2: cipher.identity.address2 ? cipher.identity.address2.encryptedString : null,
                    address3: cipher.identity.address3 ? cipher.identity.address3.encryptedString : null,
                    city: cipher.identity.city ? cipher.identity.city.encryptedString : null,
                    state: cipher.identity.state ? cipher.identity.state.encryptedString : null,
                    postalCode: cipher.identity.postalCode ? cipher.identity.postalCode.encryptedString : null,
                    country: cipher.identity.country ? cipher.identity.country.encryptedString : null,
                    company: cipher.identity.company ? cipher.identity.company.encryptedString : null,
                    email: cipher.identity.email ? cipher.identity.email.encryptedString : null,
                    phone: cipher.identity.phone ? cipher.identity.phone.encryptedString : null,
                    ssn: cipher.identity.ssn ? cipher.identity.ssn.encryptedString : null,
                    username: cipher.identity.username ? cipher.identity.username.encryptedString : null,
                    passportNumber: cipher.identity.passportNumber ?
                        cipher.identity.passportNumber.encryptedString : null,
                    licenseNumber: cipher.identity.licenseNumber ? cipher.identity.licenseNumber.encryptedString : null,
                };
                break;
            default:
                break;
        }

        if (cipher.fields) {
            this.fields = [];
            cipher.fields.forEach((field: any) => {
                this.fields.push({
                    type: field.type,
                    name: field.name ? field.name.encryptedString : null,
                    value: field.value ? field.value.encryptedString : null,
                });
            });
        }
    }
}

export { CipherRequest };
(window as any).CipherRequest = CipherRequest;
