use anyhow::Result;
use security_framework::passwords::{
    delete_generic_password, get_generic_password, set_generic_password,
};

pub async fn get_password(service: &str, account: &str) -> Result<String> {
    let result = String::from_utf8(get_generic_password(&service, &account)?)?;
    Ok(result)
}

pub async fn get_password_keytar(service: &str, account: &str) -> Result<String> {
    get_password(service, account).await
}

pub async fn set_password(service: &str, account: &str, password: &str) -> Result<()> {
    let result = set_generic_password(&service, &account, password.as_bytes())?;
    Ok(result)
}

pub async fn delete_password(service: &str, account: &str) -> Result<()> {
    let result = delete_generic_password(&service, &account)?;
    Ok(result)
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
