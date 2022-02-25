#[cfg(target_os = "macos")]
use mac as imp;
#[cfg(not(any(target_os = "macos", windows)))]
use unix as imp;
#[cfg(windows)]
use win as imp;

#[cfg(any(target_os = "redox", unix))]
mod unix;
#[cfg(not(any(target_os = "redox", unix, windows)))]
mod unknown;
#[cfg(windows)]
mod win;

pub async fn available() -> bool {
    imp::available().await
}

pub async fn verify(
    message: &str,
    window_handle: isize,
) -> Result<bool, Box<dyn std::error::Error + Send + Sync>> {
    imp::verify(message, window_handle).await
}
