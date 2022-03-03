use anyhow::Result;
use security_framework::passwords::{
    delete_generic_password, get_generic_password, set_generic_password,
};

pub async fn get_password<'a>(service: &str, account: &str) -> Result<String> {
    get_generic_password(&service, &account)
        .map_err(anyhow::Error::msg)
        .and_then(|r| String::from_utf8(r).map_err(anyhow::Error::msg))
}

pub async fn set_password(service: &str, account: &str, password: &str) -> Result<()> {
    set_generic_password(&service, &account, password.as_bytes()).map_err(anyhow::Error::msg)
}

pub async fn delete_password(service: &str, account: &str) -> Result<()> {
    delete_generic_password(&service, &account).map_err(anyhow::Error::msg)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test() {
        set_password("BitwardenTest", "BitwardenTest", "Random")
            .await
            .unwrap();
        assert_eq!(
            "Random",
            get_password("BitwardenTest", "BitwardenTest")
                .await
                .unwrap()
        );
        delete_password("BitwardenTest", "BitwardenTest")
            .await
            .unwrap();
    }
}
