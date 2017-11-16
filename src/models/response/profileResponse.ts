import { ProfileOrganizationResponse } from './profileOrganizationResponse';

class ProfileResponse {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    masterPasswordHint: string;
    premium: boolean;
    culture: string;
    twoFactorEnabled: boolean;
    key: string;
    privateKey: string;
    securityStamp: string;
    organizations: ProfileOrganizationResponse[] = [];

    constructor(response: any) {
        this.id = response.Id;
        this.name = response.Name;
        this.email = response.Email;
        this.emailVerified = response.EmailVerified;
        this.masterPasswordHint = response.MasterPasswordHint;
        this.premium = response.Premium;
        this.culture = response.Culture;
        this.twoFactorEnabled = response.TwoFactorEnabled;
        this.key = response.Key;
        this.privateKey = response.PrivateKey;
        this.securityStamp = response.SecurityStamp;

        if (response.Organizations) {
            response.Organizations.forEach((org: any) => {
                this.organizations.push(new ProfileOrganizationResponse(org));
            });
        }
    }
}

export { ProfileResponse };
(window as any).ProfileResponse = ProfileResponse;
