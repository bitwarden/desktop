import log from 'electron-log';
import * as path from 'path';

import { isDev } from '../scripts/utils';

import { LogLevelType } from 'jslib/enums/logLevelType';

import { LogService as LogServiceAbstraction } from 'jslib/abstractions/log.service';

export class LogService implements LogServiceAbstraction {
    constructor(private filter: (level: LogLevelType) => boolean = null, logDir: string = null) {
        if (log.transports == null) {
            return;
        }

        log.transports.file.level = 'info';
        if (logDir != null) {
            log.transports.file.file = path.join(logDir, 'app.log');
        }
    }

    debug(message: string) {
        if (!isDev()) {
            return;
        }

        this.write(LogLevelType.Debug, message);
    }

    info(message: string) {
        this.write(LogLevelType.Info, message);
    }

    warning(message: string) {
        this.write(LogLevelType.Warning, message);
    }

    error(message: string) {
        this.write(LogLevelType.Error, message);
    }

    write(level: LogLevelType, message: string) {
        if (this.filter != null && this.filter(level)) {
            return;
        }

        switch (level) {
            case LogLevelType.Debug:
                log.debug(message);
                break;
            case LogLevelType.Info:
                log.info(message);
                break;
            case LogLevelType.Warning:
                log.warn(message);
                break;
            case LogLevelType.Error:
                log.error(message);
                break;
            default:
                break;
        }
    }
}
