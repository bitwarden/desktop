use anyhow::{anyhow, Result};
use libsecret::{password_clear_sync, password_lookup_sync, password_store_sync, Schema};
use std::collections::HashMap;

pub async fn get_password<'a>(service: &str, account: &str) -> Result<String> {
    let res = password_lookup_sync(
        Some(&get_schema()),
        build_attributes(service, account),
        gio::Cancellable::NONE,
    )
    .map_err(anyhow::Error::msg)?;

    match res {
        Some(s) => Ok(String::from(s)),
        None => Err(anyhow!("No password found")),
    }
}

pub async fn set_password(service: &str, account: &str, password: &str) -> Result<()> {
    password_store_sync(
        Some(&get_schema()),
        build_attributes(service, account),
        Some(&libsecret::COLLECTION_DEFAULT),
        format!("{}/{}", service, account).as_str(),
        password,
        gio::Cancellable::NONE,
    )
    .map_err(anyhow::Error::msg)
}

pub async fn delete_password(service: &str, account: &str) -> Result<()> {
    password_clear_sync(
        Some(&get_schema()),
        build_attributes(service, account),
        gio::Cancellable::NONE,
    )
    .map_err(anyhow::Error::msg)
}

fn get_schema() -> Schema {
    let mut attributes = std::collections::HashMap::new();
    attributes.insert("service", libsecret::SchemaAttributeType::String);
    attributes.insert("account", libsecret::SchemaAttributeType::String);

    libsecret::Schema::new(
        "org.freedesktop.Secret.Generic",
        libsecret::SchemaFlags::NONE,
        attributes,
    )
}

fn build_attributes<'a>(service: &'a str, account: &'a str) -> HashMap<&'a str, &'a str> {
    let mut attributes = HashMap::new();
    attributes.insert("service", service);
    attributes.insert("account", account);

    attributes
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
