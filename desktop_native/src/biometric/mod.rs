#[cfg_attr(target_os = "linux", path = "unix.rs")]
#[cfg_attr(target_os = "windows", path = "windows.rs")]
#[cfg_attr(target_os = "macos", path = "mac/mod.rs")]
mod imp;

pub async fn available() -> bool {
    imp::available().await
}

pub async fn verify(
    message: &str,
    window_handle: isize,
) -> Result<bool, Box<dyn std::error::Error + Send + Sync>> {
    imp::verify(message, window_handle).await
}
