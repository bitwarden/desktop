use windows::core::*;
use windows::Foundation::IAsyncOperation;
use windows::Security::Credentials::UI::*;
use windows::Win32::Foundation::HWND;
use windows::Win32::System::WinRT::IUserConsentVerifierInterop;

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

pub async fn verify(
    message: &str,
    window_handle: isize,
) -> std::result::Result<bool, Box<dyn std::error::Error + Send + Sync>> {
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
}

#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn available() {
        // TODO Mock!
        // assert_eq!(true, super::available().await)
    }

    #[test]
    fn verify() {
        // TODO Mock!
        //assert_eq!(true, super::verify("test", 0))
    }
}
