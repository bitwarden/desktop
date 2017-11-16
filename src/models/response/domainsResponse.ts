import { GlobalDomainResponse } from './globalDomainResponse';

class DomainsResponse {
    equivalentDomains: string[][];
    globalEquivalentDomains: GlobalDomainResponse[] = [];

    constructor(response: any) {
        this.equivalentDomains = response.EquivalentDomains;

        this.globalEquivalentDomains = [];
        if (response.GlobalEquivalentDomains) {
            response.GlobalEquivalentDomains.forEach((domain: any) => {
                this.globalEquivalentDomains.push(new GlobalDomainResponse(domain));
            });
        }
    }
}

export { DomainsResponse };
(window as any).DomainsResponse = DomainsResponse;
