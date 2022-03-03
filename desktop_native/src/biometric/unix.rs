pub async fn available() -> bool {
    false
}

pub async fn verify(
    message: &str,
    window_handle: isize,
) -> std::result::Result<bool, Box<dyn std::error::Error + Send + Sync>> {
    Ok(false)
}

#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn available() {
        assert_eq!(false, super::available().await)
    }

    #[tokio::test]
    async fn verify() {
        assert_eq!(false, super::verify("", 0).await.unwrap())
    }
}
