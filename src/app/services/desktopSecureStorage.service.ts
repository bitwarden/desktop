import { Injectable } from '@angular/core';
import { getPassword, setPassword, deletePassword } from 'keytar';

import { StorageService } from 'jslib/abstractions';

@Injectable()
export class DesktopSecureStorageService implements StorageService {
    async get<T>(key: string): Promise<T> {
        const val: string = await getPassword('bitwarden', key);
        return val ? JSON.parse(val) as T : null
    }

    async save(key: string, obj: any): Promise<any> {
        await setPassword('bitwarden', key, JSON.stringify(obj));
    }

    async remove(key: string): Promise<any> {
        await deletePassword('bitwarden', key);
    }
}
