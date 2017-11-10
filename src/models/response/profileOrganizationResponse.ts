class ProfileOrganizationResponse {
    id: string;
    name: string;
    useGroups: boolean;
    useDirectory: boolean;
    useTotp: boolean;
    seats: number;
    maxCollections: number;
    maxStorageGb?: number;
    key: string;
    status: number; // TODO: map to enum
    type: number; // TODO: map to enum

    constructor(response: any) {
        this.id = response.Id;
        this.name = response.Name;
        this.useGroups = response.UseGroups;
        this.useDirectory = response.UseDirectory;
        this.useTotp = response.UseTotp;
        this.seats = response.Seats;
        this.maxCollections = response.MaxCollections;
        this.maxStorageGb = response.MaxStorageGb;
        this.key = response.Key;
        this.status = response.Status;
        this.type = response.Type;
    }
}

export { ProfileOrganizationResponse };
(window as any).ProfileOrganizationResponse = ProfileOrganizationResponse;
