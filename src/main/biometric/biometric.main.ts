export abstract class BiometricMain {
  isError: boolean;
  init: () => Promise<void>;
  supportsBiometric: () => Promise<boolean>;
  authenticateBiometric: () => Promise<boolean>;
}
