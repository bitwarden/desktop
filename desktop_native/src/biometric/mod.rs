#[cfg(windows)]
use win as imp;
#[cfg(target_os = "macos")]
use mac as imp;
#[cfg(not(any(target_os = "macos", windows)))]
use unix as imp;

#[cfg(any(target_os = "redox", unix))]
mod unix;
#[cfg(not(any(target_os = "redox", unix, windows)))]
mod unknown;
#[cfg(windows)]
mod win;

pub async fn available() -> bool {
    imp::available().await
}

pub fn verify() -> bool {
    imp::verify()
}
