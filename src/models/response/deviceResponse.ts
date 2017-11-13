import { BrowserType } from '../../enums/browserType.enum';

class DeviceResponse {
    id: string;
    name: number;
    identifier: string;
    type: BrowserType;
    creationDate: string;

    constructor(response: any) {
        this.id = response.Id;
        this.name = response.Name;
        this.identifier = response.Identifier;
        this.type = response.Type;
        this.creationDate = response.CreationDate;
    }
}

export { DeviceResponse };
(window as any).DeviceResponse = DeviceResponse;
