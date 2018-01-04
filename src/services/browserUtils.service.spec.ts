import BrowserUtilsService from './browserUtils.service';
import { BrowserType } from '../enums/browserType.enum';

describe('Browser Utils Service', () => {
    describe('getDomain', () => {
        it('should fail for invalid urls', () => {
            expect(BrowserUtilsService.getDomain(null)).toBeNull();
            expect(BrowserUtilsService.getDomain(undefined)).toBeNull();
            expect(BrowserUtilsService.getDomain(' ')).toBeNull();
            expect(BrowserUtilsService.getDomain('https://bit!:"_&ward.com')).toBeNull();
            expect(BrowserUtilsService.getDomain('bitwarden')).toBeNull();
        });

        it('should handle urls without protocol', () => {
            expect(BrowserUtilsService.getDomain('bitwarden.com')).toBe('bitwarden.com');
            expect(BrowserUtilsService.getDomain('wrong://bitwarden.com')).toBe('bitwarden.com');
        });

        it('should handle valid urls', () => {
            expect(BrowserUtilsService.getDomain('https://bitwarden')).toBe('bitwarden');
            expect(BrowserUtilsService.getDomain('https://bitwarden.com')).toBe('bitwarden.com');
            expect(BrowserUtilsService.getDomain('http://bitwarden.com')).toBe('bitwarden.com');
            expect(BrowserUtilsService.getDomain('http://vault.bitwarden.com')).toBe('bitwarden.com');
            expect(BrowserUtilsService.getDomain('https://user:password@bitwarden.com:8080/password/sites?and&query#hash')).toBe('bitwarden.com');
            expect(BrowserUtilsService.getDomain('https://bitwarden.unknown')).toBe('bitwarden.unknown');
        });

        it('should support localhost and IP', () => {
            expect(BrowserUtilsService.getDomain('https://localhost')).toBe('localhost');
            expect(BrowserUtilsService.getDomain('https://192.168.1.1')).toBe('192.168.1.1');
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
    
            const browserUtilsService = new BrowserUtilsService();
            expect(browserUtilsService.getBrowser()).toBe(BrowserType.Chrome);
        });

        it('should detect firefox', () => {
            Object.defineProperty(navigator, 'userAgent', {
                configurable: true,
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0'
            });
    
            const browserUtilsService = new BrowserUtilsService();
            expect(browserUtilsService.getBrowser()).toBe(BrowserType.Firefox);
        });

        it('should detect opera', () => {
            Object.defineProperty(navigator, 'userAgent', {
                configurable: true,
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3175.3 Safari/537.36 OPR/49.0.2695.0 (Edition developer)'
            });
    
            const browserUtilsService = new BrowserUtilsService();
            expect(browserUtilsService.getBrowser()).toBe(BrowserType.Opera);
        });

        it('should detect edge', () => {
            Object.defineProperty(navigator, 'userAgent', {
                configurable: true,
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; ServiceUI 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.15063'
            });
    
            const browserUtilsService = new BrowserUtilsService();
            expect(browserUtilsService.getBrowser()).toBe(BrowserType.Edge);
        });
    });
});
