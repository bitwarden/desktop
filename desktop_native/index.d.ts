/* tslint:disable */
/* eslint-disable */

/* auto-generated by NAPI-RS */

export namespace passwords {
  /** Fetch the stored password from the keychain. */
  export function getPassword(service: string, account: string): Promise<string>
  /** Fetch the stored password from the keychain. */
  export function getPasswordKeytar(service: string, account: string): Promise<string>
  /** Save the password to the keychain. Adds an entry if none exists otherwise updates the existing entry. */
  export function setPassword(service: string, account: string, password: string): Promise<void>
  /** Delete the stored password from the keychain. */
  export function deletePassword(service: string, account: string): Promise<void>
}
export namespace biometrics {
  /** Check if biometric is supported and can be used. */
  export function supported(): Promise<boolean>
  /** Verify user presence. */
  export function prompt(message: string, windowHandle?: number | undefined | null): Promise<boolean>
  /**
   * Enable biometric for the specific account, stores the encrypted password in keychain on macOS,
   * gnome keyring on Unix, and returns an encrypted string on Windows.
   */
  export function enable(account: string, password: string, message: string): Promise<string>
  /** Remove the stored biometric key for the specified account. */
  export function disable(account: string): Promise<void>
  /** Decrypt the secured password after verifying the user presense using biometric. */
  export function decrypt(account: string, encryptedPassword: string): Promise<string>
}
