import AutofillField from './autofillField';
import AutofillForm from './autofillForm';

export default class AutofillPageDetails {
    documentUUID: string;
    title: string;
    url: string;
    documentUrl: string;
    tabUrl: string;
    forms: { [id: string]: AutofillForm; };
    fields: AutofillField[];
    collectedTimestamp: number;
}
