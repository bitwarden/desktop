import { UtilsService } from '../../../services/abstractions/utils.service';

class StateService {
    private state: any = {};

    constructor(private utilsService: UtilsService, private constantsService: any) {
    }

    async init() {
        const faviconsDisabled = await this.utilsService
            .getObjFromStorage<boolean>(this.constantsService.disableFaviconKey);

        this.saveState('faviconEnabled', !faviconsDisabled);
    }

    saveState(key: string, data: any) {
        this.state[key] = data;
    }

    getState(key: string): any {
        if (key in this.state) {
            return this.state[key];
        }

        return null;
    }

    removeState(key: string) {
        delete this.state[key];
    }

    purgeState() {
        this.state = {};
    }
}

export default StateService;
