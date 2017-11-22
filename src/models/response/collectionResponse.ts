class CollectionResponse {
    id: string;
    organizationId: string;
    name: string;

    constructor(response: any) {
        this.id = response.Id;
        this.organizationId = response.OrganizationId;
        this.name = response.Name;
    }
}

export { CollectionResponse };
(window as any).CollectionResponse = CollectionResponse;
