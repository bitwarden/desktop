class GlobalDomainResponse {
    type: number;
    domains: string[];
    excluded: number[];

    constructor(response: any) {
        this.type = response.Type;
        this.domains = response.Domains;
        this.excluded = response.Excluded;
    }
}

export { GlobalDomainResponse };
(window as any).GlobalDomainResponse = GlobalDomainResponse;
