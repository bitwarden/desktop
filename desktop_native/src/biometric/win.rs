use windows::Security::Credentials::UI::*;
use windows::Win32::System::WinRT::IUserConsentVerifierInterop;
use windows::Win32::Foundation::HWND;
use windows::{core::*, Win32::System::Com::*};
use windows::Foundation::IAsyncOperation;
use tokio::runtime::Runtime;


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
            _ => false
        }
    }
}

pub fn verify() -> bool {
    Runtime::new().unwrap().block_on(available());
    println!("HI");
    let message = HSTRING::from("hello world");

    unsafe { CoInitializeEx(std::ptr::null(), COINIT_MULTITHREADED).unwrap() };

    let hw: HWND = HWND::default();
    let verifier: IUserConsentVerifierInterop = unsafe { CoCreateInstance(&IUserConsentVerifierInterop::IID, None, CLSCTX_ALL).unwrap() };
    let test: Result<IAsyncOperation<UserConsentVerificationResult>> = unsafe { verifier.RequestVerificationForWindowAsync(hw, message) };
    println!("{:?}", test);
    /*
    let result = match event {
        Err(_) => return false,
        Ok(t) => t.await,
    };

    match result {
        Err(_) => false,
        Ok(t) => match t {
            UserConsentVerificationResult::Verified => true,
            _ => false
        }
    }
    */
    false
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
        assert_eq!(true, super::verify())
    }
}

