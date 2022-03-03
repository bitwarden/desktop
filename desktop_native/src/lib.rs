#[macro_use]
extern crate napi_derive;

mod biometric;
mod password;

#[allow(dead_code)]
#[napi]
mod passwords {
    /// Fetch the stored password from the keychain.
    #[napi]
    pub async fn get_password(service: String, account: String) -> napi::Result<String> {
        super::password::get_password(service.as_str(), account.as_str())
            .await
            .map_err(|e| napi::Error::from_reason(e.to_string()))
    }

    /// Save the password to the keychain. Adds an entry if none exists otherwise updates the existing entry.
    #[napi]
    pub async fn set_password(
        service: String,
        account: String,
        password: String,
    ) -> napi::Result<()> {
        super::password::set_password(service.as_str(), account.as_str(), password.as_str())
            .await
            .map_err(|e| napi::Error::from_reason(e.to_string()))
    }

    /// Delete the stored password from the keychain.
    #[napi]
    pub async fn delete_password(service: String, account: String) -> napi::Result<()> {
        super::password::delete_password(service.as_str(), account.as_str())
            .await
            .map_err(|e| napi::Error::from_reason(e.to_string()))
    }
}

#[allow(dead_code)]
#[napi]
mod biometrics {
    /// Verify user presence.
    #[napi]
    pub async fn prompt(message: String) {
        println!("{}", message);
    }

    /// Enable biometric for the specific account, stores the encrypted password in keychain on macOS,
    /// gnome keyring on Unix, and returns an encrypted string on Windows.
    #[napi]
    pub async fn enable(
        account: String,
        password: String,
        message: String,
    ) -> napi::Result<String> {
        println!("{}, {}, {}", account, password, message);

        Ok(String::from(""))
    }

    #[napi]
    /// Remove the stored biometric key for the specified account.
    pub async fn disable(account: String) {
        println!("{}", account);
    }

    /// Decrypt the secured password after verifying the user presense using biometric.
    #[napi]
    pub async fn decrypt(account: String, encrypted_password: String) -> napi::Result<String> {
        println!("{}, {}", account, encrypted_password);

        Ok(String::from(""))
    }
}
