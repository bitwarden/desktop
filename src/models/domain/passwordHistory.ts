export default class PasswordHistory {
    password: string;
    date: number;

    constructor(password: string, date: number) {
        this.password = password;
        this.date = date;
    }
}
