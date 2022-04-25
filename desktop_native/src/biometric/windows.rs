use anyhow::Result;
use windows::{
    core::factory, Foundation::IAsyncOperation, Security::Credentials::UI::*,
    Win32::Foundation::HWND, Win32::System::WinRT::IUserConsentVerifierInterop,
};

pub fn prompt(hwnd: Vec<u8>, message: String) -> Result<bool> {
    let interop = factory::<UserConsentVerifier, IUserConsentVerifierInterop>()?;

    let h = isize::from_le_bytes(hwnd.try_into().unwrap());
    let window = HWND(h);

    let operation: IAsyncOperation<UserConsentVerificationResult> =
        unsafe { interop.RequestVerificationForWindowAsync(window, message)? };

    let result: UserConsentVerificationResult = operation.get()?;

    match result {
        UserConsentVerificationResult::Verified => Ok(true),
        _ => Ok(false),
    }
}

pub fn available() -> Result<bool> {
    let ucv_available = UserConsentVerifier::CheckAvailabilityAsync()?.get()?;

    match ucv_available {
        UserConsentVerifierAvailability::Available => Ok(true),
        UserConsentVerifierAvailability::DeviceBusy => Ok(true), // TODO: Look into removing this and making the check more ad-hoc
        _ => Ok(false),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_prompt() {
        prompt(
            vec![0, 0, 0, 0, 0, 0, 0, 0],
            String::from("Hello from Rust"),
        )
        .unwrap();
    }

    #[test]
    fn test_available() {
        assert!(available().unwrap())
    }
}
