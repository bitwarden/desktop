import { isDev } from 'jslib/electron/utils';
import { LogLevelType } from 'jslib/enums/logLevelType';
import { ConsoleLogService } from 'jslib/services/consoleLog.service';

export class ElectronLogService extends ConsoleLogService {
    protected timersMap: Map<string, [number, number]> = new Map();
    protected isDev: boolean;

    constructor(protected filter: (level: LogLevelType) => boolean = null) {
        super(isDev(), filter);
    }
}
