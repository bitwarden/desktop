import { Services } from '@bitwarden/jslib';

describe('Utils Service', () => {
    describe('getHostname', () => {
        it('should fail for invalid urls', () => {
            expect(Services.UtilsService.getHostname(null)).toBeNull();
            expect(Services.UtilsService.getHostname(undefined)).toBeNull();
            expect(Services.UtilsService.getHostname(' ')).toBeNull();
            expect(Services.UtilsService.getHostname('https://bit!:"_&ward.com')).toBeNull();
            expect(Services.UtilsService.getHostname('bitwarden')).toBeNull();
        });

        it('should handle valid urls', () => {
            expect(Services.UtilsService.getHostname('https://bitwarden.com')).toBe('bitwarden.com');
            expect(Services.UtilsService.getHostname('http://bitwarden.com')).toBe('bitwarden.com');
            expect(Services.UtilsService.getHostname('http://vault.bitwarden.com')).toBe('vault.bitwarden.com');
            expect(Services.UtilsService.getHostname('https://user:password@bitwarden.com:8080/password/sites?and&query#hash')).toBe('bitwarden.com');
        });

        it('should support localhost and IP', () => {
            expect(Services.UtilsService.getHostname('https://localhost')).toBe('localhost');
            expect(Services.UtilsService.getHostname('https://192.168.1.1')).toBe('192.168.1.1');
        });
    });

    describe('newGuid', () => {
        it('should create a valid guid', () => {
            const validGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            expect(Services.UtilsService.newGuid()).toMatch(validGuid);
        });
    });
});
