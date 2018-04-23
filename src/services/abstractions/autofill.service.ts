import AutofillPageDetails from '../../models/autofillPageDetails';

export abstract class AutofillService {
    getFormsWithPasswordFields: (pageDetails: AutofillPageDetails) => any[];
    doAutoFill: (options: any) => Promise<string>;
    doAutoFillForLastUsedLogin: (pageDetails: any, fromCommand: boolean) => Promise<string>;
}
