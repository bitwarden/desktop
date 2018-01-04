export interface UtilsService {
    copyToClipboard(text: string, doc?: Document): void;
    getHostname(uriString: string): string;
}
