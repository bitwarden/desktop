#[cfg(target_os = "macos")]
use mac as imp;
#[cfg(not(any(target_os = "macos", windows)))]
use unix as imp;
#[cfg(windows)]
use win as imp;

#[cfg(target_os = "macos")]
mod mac;
#[cfg(not(any(target_os = "macos", windows)))]
mod unix;
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
