import { CryptoService } from './abstractions/crypto.service';

export default class ContainerService {
    static cryptoService: CryptoService = null;
}
