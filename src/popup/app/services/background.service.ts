function getBackgroundService(service: string) {
    return () => {
        const page = chrome.extension.getBackgroundPage();
        return page ? page['bg_' + service] : null;
    };
}

export const tokenService = getBackgroundService('tokenService');
export const cryptoService = getBackgroundService('cryptoService');
export const userService = getBackgroundService('userService');
export const apiService = getBackgroundService('apiService');
export const folderService = getBackgroundService('folderService');
export const cipherService = getBackgroundService('cipherService');
export const syncService = getBackgroundService('syncService');
export const autofillService = getBackgroundService('autofillService');
export const passwordGenerationService = getBackgroundService('passwordGenerationService');
export const utilsService = getBackgroundService('utilsService');
export const appIdService = getBackgroundService('appIdService');
export const i18nService = getBackgroundService('i18nService');
export const constantsService = getBackgroundService('constantsService');
export const settingsService = getBackgroundService('settingsService');
export const lockService = getBackgroundService('lockService');
export const totpService = getBackgroundService('totpService');
export const environmentService = getBackgroundService('environmentService');
