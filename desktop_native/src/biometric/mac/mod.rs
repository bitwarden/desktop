use anyhow::{anyhow, Result};
use core_foundation::{
    base::{kCFAllocatorDefault, CFType, CFTypeRef, OSStatus, TCFType},
    data::CFData,
    declare_TCFType,
    dictionary::CFDictionary,
    impl_TCFType,
    string::CFString,
};
use security_framework::passwords::{delete_generic_password, get_generic_password};
use security_framework_sys::{
    base::errSecSuccess,
    item::{kSecAttrAccount, kSecAttrService, kSecClass, kSecClassGenericPassword, kSecValueData},
    keychain_item::SecItemAdd,
};

mod ffi;
use ffi::*;

declare_TCFType!(SecAccessControl, SecAccessControlRef);
impl_TCFType!(
    SecAccessControl,
    SecAccessControlRef,
    SecAccessControlGetTypeID
);

pub async fn available() -> bool {
    false
}

pub async fn verify(
    message: &str,
    window_handle: isize,
) -> std::result::Result<bool, Box<dyn std::error::Error + Send + Sync>> {
    /*let key_chain = SecKeychain::default_for_domain(SecPreferencesDomain::User)?;

    key_chain.add_generic_password("BitwardenTest", "Test", "pass".as_bytes())?;

    let acc = key_chain.find_generic_password("BitwardenTest", "Test")?;
    */

    /*

    let mut error: CFTypeRef = std::ptr::null();

    let access_control = unsafe {
        SecAccessControlCreateWithFlags(
            kCFAllocatorDefault,
            CFString::wrap_under_get_rule(kSecAttrAccessibleWhenUnlockedThisDeviceOnly)
                .as_CFTypeRef(),
            kSecAccessControlBiometryAny,
            &mut error,
        )
    };

    println!("{:?}", error);

    let dict = CFDictionary::from_CFType_pairs(&[
        (
            unsafe { CFString::wrap_under_get_rule(kSecClass) },
            unsafe { CFString::wrap_under_get_rule(kSecClassGenericPassword).as_CFType() },
        ),
        (
            unsafe { CFString::wrap_under_get_rule(kSecAttrAccessControl) },
            unsafe { SecAccessControl::wrap_under_get_rule(access_control.into()).as_CFType() },
        ),
        (
            unsafe { CFString::wrap_under_get_rule(kSecAttrAccount) },
            CFString::from("BitwardenTest").as_CFType(),
        ),
        (
            unsafe { CFString::wrap_under_get_rule(kSecValueData) },
            CFData::from_buffer("BitwardenTest".as_bytes()).as_CFType(),
        ),
    ]);

    let mut key_bits: CFTypeRef = std::ptr::null();

    let status = unsafe { SecItemAdd(dict.as_concrete_TypeRef(), &mut key_bits) };

    println!("{:?}", status);
    println!("{:?}", key_bits);
    */

    let res = create_generic_password_biometric("", "BitwardenTest", "BitwardenTest".as_bytes());
    println!("{:?}", res);

    /*
        let query = unsafe {
            CFDictionary::from_CFType_pairs(&[
                (
                    CFString::wrap_under_get_rule(kSecClass.into()).as_CFType(),
                    CFString::wrap_under_get_rule(kSecClassGenericPassword.into()).as_CFType(),
                ),
                (
                    CFString::wrap_under_get_rule(kSecAttrAccount).as_CFType(),
                    CFString::from("BitwardenTest").as_CFType(),
                ),
                /*
                (
                    CFString::wrap_under_get_rule(kSecMatchLimit.into()).as_CFType(),
                    CFString::wrap_under_get_rule(kSecMatchLimitOne.into()).as_CFType(),
                ),
                */
                (
                    CFString::wrap_under_get_rule(kSecReturnData.into()).as_CFType(),
                    CFBoolean::from(true).as_CFType(),
                ),
            ])
        };

        let mut result: CFTypeRef = std::ptr::null_mut();

        let status = unsafe { SecItemCopyMatching(query.as_concrete_TypeRef(), &mut result) };
        println!("{:?}", status);
        println!("{:?}", result);
    */

    let result = get_generic_password("", "BitwardenTest");
    println!("{:?}", String::from_utf8(result?));

    delete_generic_password("", "BitwardenTest")?;

    Ok(false)
}

// Creates a generic password protected with biometric
fn create_generic_password_biometric(service: &str, account: &str, password: &[u8]) -> Result<()> {
    let mut error: CFTypeRef = std::ptr::null();

    let access_control = unsafe {
        SecAccessControlCreateWithFlags(
            kCFAllocatorDefault,
            CFString::wrap_under_get_rule(kSecAttrAccessibleWhenUnlockedThisDeviceOnly)
                .as_CFTypeRef(),
            kSecAccessControlBiometryAny,
            &mut error,
        )
    };

    if !error.is_null() {
        return Err(anyhow!("Unable to create AccessControl"));
    }

    let mut query = generic_password_query(service, account);
    query.push((
        unsafe { CFString::wrap_under_get_rule(kSecValueData) },
        CFData::from_buffer(password).as_CFType(),
    ));
    query.push((
        unsafe { CFString::wrap_under_get_rule(kSecAttrAccessControl) },
        unsafe { SecAccessControl::wrap_under_get_rule(access_control).as_CFType() },
    ));

    let params = CFDictionary::from_CFType_pairs(&query);
    let mut ret = std::ptr::null();
    let status = unsafe { SecItemAdd(params.as_concrete_TypeRef(), &mut ret) };

    cvt(status)
}

// Copied from https://github.com/kornelski/rust-security-framework/181b65d9001ee56d6821b3e2b379bcc589c9e0ce/main/security-framework/src/passwords.rs#L137
// Licensed under Apache 2.0
fn generic_password_query(service: &str, account: &str) -> Vec<(CFString, CFType)> {
    let query = vec![
        (
            unsafe { CFString::wrap_under_get_rule(kSecClass) },
            unsafe { CFString::wrap_under_get_rule(kSecClassGenericPassword).as_CFType() },
        ),
        (
            unsafe { CFString::wrap_under_get_rule(kSecAttrService) },
            CFString::from(service).as_CFType(),
        ),
        (
            unsafe { CFString::wrap_under_get_rule(kSecAttrAccount) },
            CFString::from(account).as_CFType(),
        ),
    ];
    query
}

// Copied from https://github.com/kornelski/rust-security-framework/blob/181b65d9001ee56d6821b3e2b379bcc589c9e0ce/security-framework/src/lib.rs
// Licensed under Apache 2.0
#[inline(always)]
fn cvt(err: OSStatus) -> Result<()> {
    match err {
        #![allow(non_upper_case_globals)]
        errSecSuccess => Ok(()),
        err => Err(anyhow!(err)),
    }
}

#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn available() {
        //assert_eq!(false, super::available().await)
    }

    #[tokio::test]
    async fn verify() {
        //assert_eq!(false, super::verify("", 0).await.unwrap())
    }
}
