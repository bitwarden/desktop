import { CollectionResponse } from '../response/collectionResponse';

class CollectionData {
    id: string;
    organizationId: string;
    name: string;

    constructor(response: CollectionResponse) {
        this.id = response.id;
        this.organizationId = response.organizationId;
        this.name = response.name;
    }
}

export { CollectionData };
(window as any).CollectionData = CollectionData;
