use windows::core::*;
use windows::Foundation::IAsyncOperation;
use windows::Security::Credentials::UI::*;
//use windows::Win32::Foundation::HWND;
//use windows::Win32::System::WinRT::IUserConsentVerifierInterop;
use anyhow::anyhow;
use windows::Security::Credentials::*;
use windows::Storage::Streams::{DataWriter, IBuffer};
use windows::Win32::System::WinRT::IBufferByteAccess;

pub async fn available() -> bool {
    let event = UserConsentVerifier::CheckAvailabilityAsync();
    let result = match event {
        Err(_) => return false,
        Ok(t) => t.await,
    };

    match result {
        Err(_) => false,
        Ok(t) => match t {
            UserConsentVerifierAvailability::Available => true,
            UserConsentVerifierAvailability::DeviceBusy => true,
            _ => false,
        },
    }
}

async fn createEncryptionKey<'a>(name: &'a str, challenge: &'a str) -> anyhow::Result<&'a str> {
    let result = KeyCredentialManager::OpenAsync(name)?.await?;

    let result = match result.Status()? {
        KeyCredentialStatus::NotFound => {
            KeyCredentialManager::RequestCreateAsync(
                name,
                KeyCredentialCreationOption::ReplaceExisting,
            )?
            .await?
        }
        KeyCredentialStatus::Success => result,
        _ => return Err(anyhow!("Error")),
    };

    let credential = result.Credential()?;

    let challenge_writer: DataWriter = DataWriter::new()?;

    match challenge_writer.WriteString(challenge) {
        Err(e) => return Err(e.into()),
        Ok(_) => (),
    };

    let challenge_buffer = challenge_writer.DetachBuffer()?;

    let sign_result: KeyCredentialOperationResult =
        credential.RequestSignAsync(challenge_buffer)?.await?;

    Ok("hi")
}

pub async fn verify(
    message: &str,
    window_handle: isize,
) -> std::result::Result<bool, Box<dyn std::error::Error + Send + Sync>> {
    createEncryptionKey("test123", "random").await;

    //KeyCredentialManager::RequestCreateAsync("test", KeyCredentialCreationOption::ReplaceExisting);
    let i_open_key_result: IAsyncOperation<KeyCredentialRetrievalResult> =
        KeyCredentialManager::OpenAsync("test").unwrap();

    let open_key_result: KeyCredentialRetrievalResult = i_open_key_result.get().unwrap();

    let user_key: KeyCredential = open_key_result.Credential().unwrap();

    let data_writer: DataWriter = DataWriter::new().unwrap();
    data_writer.WriteString("test123");

    let buffer = data_writer.DetachBuffer().unwrap();

    //let object = Buffer::Create(5)?;

    /* let bytes: *mut u8 = unsafe { object.cast::<IBufferByteAccess>()?.Buffer()? };
        let bytes = unsafe { core::slice::from_raw_parts_mut(bytes, 5) };
        bytes.copy_from_slice(&[0xAA, 0xBB, 0xBA, 0xCC, 0xBB]);
    */
    let sign_result: KeyCredentialOperationResult =
        user_key.RequestSignAsync(buffer).unwrap().await.unwrap();

    // TODO: Add logic for focusin on the dialog prompt.

    let object: IBuffer = sign_result.Result().unwrap();

    let bytes: *const u8 = unsafe { object.cast::<IBufferByteAccess>()?.Buffer()? };
    let bytes = unsafe { core::slice::from_raw_parts(bytes, object.Length().unwrap() as usize) };

    println!("{:?}", bytes);

    /*
    let interop: IUserConsentVerifierInterop =
        match factory::<UserConsentVerifier, IUserConsentVerifierInterop>() {
            Ok(i) => i,
            Err(e) => return Err(e.into()),
        };

    let window = HWND(window_handle);

    let operation: Result<IAsyncOperation<UserConsentVerificationResult>> =
        unsafe { interop.RequestVerificationForWindowAsync(window, message) };

    let result = match operation {
        Ok(r) => r.await,
        Err(e) => return Err(e.into()),
    };

    match result {
        Err(e) => return Err(e.into()),
        Ok(t) => match t {
            UserConsentVerificationResult::Verified => Ok(true),
            _ => Ok(false),
        },
    }
    */
    Ok(true)
}

#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn available() {
        // TODO Mock!
        // assert_eq!(true, super::available().await)
    }

    #[tokio::test]
    async fn verify() {
        // TODO Mock!
        //assert_eq!(true, super::verify("test", 0).await.unwrap())
    }
}
