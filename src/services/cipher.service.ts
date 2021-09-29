import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { FileUploadService } from 'jslib/abstractions/fileUpload.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { SearchService } from 'jslib/abstractions/search.service';
import { SettingsService } from 'jslib/abstractions/settings.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { UserService } from 'jslib/abstractions/user.service';
import { sequentialize } from 'jslib/misc/sequentialize';
import { CipherView } from 'jslib/models/view/cipherView';
import { CipherService as CipherServiceBase } from 'jslib/services/cipher.service';

export class CipherService extends CipherServiceBase {
    constructor(private localCryptoService: CryptoService, private localUserService: UserService,
      settingsService: SettingsService, apiService: ApiService,
      fileUploadService: FileUploadService, storageService: StorageService,
      i18nService: I18nService, private localSearchService: () => SearchService) {
        super(localCryptoService,
          localUserService,
          settingsService,
          apiService,
          fileUploadService,
          storageService,
          i18nService,
          localSearchService);
    }

    @sequentialize(() => 'getAllDecrypted')
    async getAllDecrypted(): Promise<CipherView[]> {
        if (this.decryptedCipherCache != null) {
            const userId = await this.localUserService.getUserId();
            if (this.localSearchService != null && (this.localSearchService().indexedEntityId ?? userId) !== userId)
            {
                await this.localSearchService().indexCiphers(userId, this.decryptedCipherCache);
            }
            return this.decryptedCipherCache;
        }

        const decCiphers: CipherView[] = [];
        const hasKey = await this.localCryptoService.hasKey();
        if (!hasKey) {
            throw new Error('No key.');
        }

        const orgKeys = await this.localCryptoService.getOrgKeys();
        const orgIds = orgKeys ? [...orgKeys.keys()] : [];

        const promises: any[] = [];
        const ciphers = (await this.getAll())
            .filter(cipher => !cipher.organizationId || orgIds.includes(cipher.organizationId));

        ciphers.forEach(cipher => {
            promises.push(cipher.decrypt().then(c => decCiphers.push(c)));
        });

        await Promise.all(promises);

        decCiphers.sort(this.getLocaleSortingFunction());
        this.decryptedCipherCache = decCiphers;
        return this.decryptedCipherCache;
    }

    async unshare(cipher: CipherView) {
        cipher.organizationId = null;
        cipher.collectionIds = null;

        const encCipher = await this.encrypt(cipher);

        await this.saveWithServer(encCipher);
    }
}
