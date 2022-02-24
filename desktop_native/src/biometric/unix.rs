pub async fn available() -> bool {
    false
}

pub async fn verify() -> bool {
    false
}

#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn available() {
        assert_eq!(false, super::available().await)
    }

    #[tokio::test]
    async fn verify() {
        assert_eq!(false, super::verify().await)
    }
}
