import { LogLevelType } from 'jslib/enums/logLevelType';

import { LogService as LogServiceAbstraction } from 'jslib/abstractions/log.service';

// @ts-ignore: import * as ns from "mod" error, need to do it this way
import hrtime = require('browser-process-hrtime');

export class ElectronLogService implements LogServiceAbstraction {
    protected timersMap: Map<string, [number, number]> = new Map();
    // protected isDev: boolean = true; // TODO BJA : implement isDev(), see jslib/utils
    constructor(protected isDev: boolean, private filter: (level: LogLevelType) => boolean = null) { }

    debug(message: string) {
        if (!this.isDev) {
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
                // tslint:disable-next-line
                console.log(message);
                break;
            case LogLevelType.Info:
                // tslint:disable-next-line
                console.log(message);
                break;
            case LogLevelType.Warning:
                // tslint:disable-next-line
                console.warn(message);
                break;
            case LogLevelType.Error:
                // tslint:disable-next-line
                console.error(message);
                break;
            default:
                break;
        }
    }

    time(label: string = 'default') {
        if (!this.timersMap.has(label)) {
            this.timersMap.set(label, hrtime());
        }
    }

    timeEnd(label: string = 'default'): [number, number] {
        const elapsed = hrtime(this.timersMap.get(label));
        this.timersMap.delete(label);
        this.write(LogLevelType.Info, `${label}: ${elapsed[0] * 1000 + elapsed[1] / 10e6}ms`);
        return elapsed;
    }
}
