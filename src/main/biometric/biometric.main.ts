export abstract class BiometricMain {
  init: () => Promise<void>;
  supportsBiometric: () => Promise<boolean>;
  authenticateBiometric: () => Promise<boolean>;
}
