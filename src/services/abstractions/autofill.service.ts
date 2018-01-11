import AutofillPageDetails from '../../models/autofillPageDetails';

export interface AutofillService {
    getFormsWithPasswordFields(pageDetails: AutofillPageDetails): any[];
    doAutoFill(options: any): Promise<string>;
    doAutoFillForLastUsedLogin(pageDetails: any, fromCommand: boolean): Promise<void>;
}
