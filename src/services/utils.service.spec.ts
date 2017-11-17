import UtilsService from './utils.service';

describe('Utils Service', () => {
    describe('getDomain', () => {
        it('should fail for invalid urls', () => {
            expect(UtilsService.getDomain(null)).toBeNull();
            expect(UtilsService.getDomain(undefined)).toBeNull();
            expect(UtilsService.getDomain(' ')).toBeNull();
            expect(UtilsService.getDomain('https://bit!:"_&ward.com')).toBeNull();
            expect(UtilsService.getDomain('bitwarden')).toBeNull();
        });

        it('should handle urls without protocol', () => {
            expect(UtilsService.getDomain('bitwarden.com')).toBe('bitwarden.com');
            expect(UtilsService.getDomain('wrong://bitwarden.com')).toBe('bitwarden.com');
        });

        it('should handle valid urls', () => {
            expect(UtilsService.getDomain('https://bitwarden')).toBe('bitwarden');
            expect(UtilsService.getDomain('https://bitwarden.com')).toBe('bitwarden.com');
            expect(UtilsService.getDomain('http://bitwarden.com')).toBe('bitwarden.com');
            expect(UtilsService.getDomain('http://vault.bitwarden.com')).toBe('bitwarden.com');
            expect(UtilsService.getDomain('https://user:password@bitwarden.com:8080/password/sites?and&query#hash')).toBe('bitwarden.com');
            expect(UtilsService.getDomain('https://bitwarden.unknown')).toBe('bitwarden.unknown');
        });

        it('should support localhost and IP', () => {
            expect(UtilsService.getDomain('https://localhost')).toBe('localhost');
            expect(UtilsService.getDomain('https://192.168.1.1')).toBe('192.168.1.1');
        });
    });

    describe('getHostname', () => {
        it('should fail for invalid urls', () => {
            expect(UtilsService.getHostname(null)).toBeNull();
            expect(UtilsService.getHostname(undefined)).toBeNull();
            expect(UtilsService.getHostname(' ')).toBeNull();
            expect(UtilsService.getHostname('https://bit!:"_&ward.com')).toBeNull();
            expect(UtilsService.getHostname('bitwarden')).toBeNull();
        });

        it('should handle valid urls', () => {
            expect(UtilsService.getHostname('https://bitwarden.com')).toBe('bitwarden.com');
            expect(UtilsService.getHostname('http://bitwarden.com')).toBe('bitwarden.com');
            expect(UtilsService.getHostname('http://vault.bitwarden.com')).toBe('vault.bitwarden.com');
            expect(UtilsService.getHostname('https://user:password@bitwarden.com:8080/password/sites?and&query#hash')).toBe('bitwarden.com');
        });

        it('should support localhost and IP', () => {
            expect(UtilsService.getHostname('https://localhost')).toBe('localhost');
            expect(UtilsService.getHostname('https://192.168.1.1')).toBe('192.168.1.1');
        });
    });
});
