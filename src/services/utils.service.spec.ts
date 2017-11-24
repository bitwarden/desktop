import UtilsService from './utils.service';
import { BrowserType } from '../enums/browserType.enum';

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

    describe('newGuid', () => {
        it('should create a valid guid', () => {
            const validGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            expect(UtilsService.newGuid()).toMatch(validGuid);
        });
    });

    describe('getBrowser', () => {
        const original = navigator.userAgent;

        // Reset the userAgent.
        afterAll(() => {
            Object.defineProperty(navigator, 'userAgent', {
                value: original
            });
        });

        it('should detect chrome', () => {
            Object.defineProperty(navigator, 'userAgent', {
                configurable: true,
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
            });
    
            const utilsService = new UtilsService();
            expect(utilsService.getBrowser()).toBe(BrowserType.Chrome);
        });

        it('should detect firefox', () => {
            Object.defineProperty(navigator, 'userAgent', {
                configurable: true,
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0'
            });
    
            const utilsService = new UtilsService();
            expect(utilsService.getBrowser()).toBe(BrowserType.Firefox);
        });

        it('should detect opera', () => {
            Object.defineProperty(navigator, 'userAgent', {
                configurable: true,
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3175.3 Safari/537.36 OPR/49.0.2695.0 (Edition developer)'
            });
    
            const utilsService = new UtilsService();
            expect(utilsService.getBrowser()).toBe(BrowserType.Opera);
        });

        it('should detect edge', () => {
            Object.defineProperty(navigator, 'userAgent', {
                configurable: true,
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; ServiceUI 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.15063'
            });
    
            const utilsService = new UtilsService();
            expect(utilsService.getBrowser()).toBe(BrowserType.Edge);
        });
    });
});
