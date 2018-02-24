import { Logger } from 'electron-updater';

import { LogService } from 'jslib/abstractions/log.service';

export class UpdaterLogger implements Logger {
    constructor(private logService: LogService) { }

    debug(message: string): void {
        this.logService.debug(message);
    }

    info(message?: any): void {
        if (message == null) {
            return;
        }

        this.logService.info(message);
    }

    warn(message?: any): void {
        if (message == null) {
            return;
        }

        this.logService.warning(message);
    }

    error(message?: any): void {
        if (message == null) {
            return;
        }

        this.logService.error(message);
    }
}
