use windows::Security::Credentials::UI::*;
use windows::Win32::System::WinRT::IUserConsentVerifierInterop;
use windows::Win32::Foundation::HWND;
use windows::{core::*, Win32::System::Com::*};
use windows::Foundation::IAsyncOperation;

fn main() {
    unsafe { CoInitializeEx(std::ptr::null(), COINIT_MULTITHREADED).unwrap() };

    let message = HSTRING::from("hello world");
    let hw: HWND = HWND::default();

    let verifier: IUserConsentVerifierInterop = unsafe { CoCreateInstance(&IUserConsentVerifierInterop::IID, None, CLSCTX_ALL).unwrap() };
    let test: Result<IAsyncOperation<UserConsentVerificationResult>> = unsafe { verifier.RequestVerificationForWindowAsync(hw, message) };
}
