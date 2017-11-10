class IdentityData {
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    address1: string;
    address2: string;
    address3: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    company: string;
    email: string;
    phone: string;
    ssn: string;
    username: string;
    passportNumber: string;
    licenseNumber: string;

    constructor(data: any) {
        this.title = data.Title;
        this.firstName = data.FirstName;
        this.middleName = data.MiddleName;
        this.lastName = data.LastName;
        this.address1 = data.Address1;
        this.address2 = data.Address2;
        this.address3 = data.Address3;
        this.city = data.City;
        this.state = data.State;
        this.postalCode = data.PostalCode;
        this.country = data.Country;
        this.company = data.Company;
        this.email = data.Email;
        this.phone = data.Phone;
        this.ssn = data.SSN;
        this.username = data.Username;
        this.passportNumber = data.PassportNumber;
        this.licenseNumber = data.LicenseNumber;
    }
}

export { IdentityData };
(window as any).IdentityData = IdentityData;
