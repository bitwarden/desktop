import { Response } from '@bitwarden/jslib';

class CollectionData {
    id: string;
    organizationId: string;
    name: string;

    constructor(response: Response.Collection) {
        this.id = response.id;
        this.organizationId = response.organizationId;
        this.name = response.name;
    }
}

export { CollectionData };
(window as any).CollectionData = CollectionData;
