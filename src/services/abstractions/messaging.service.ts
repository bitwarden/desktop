export interface MessagingService {
    send(subscriber: string, arg?: any): void;
}
