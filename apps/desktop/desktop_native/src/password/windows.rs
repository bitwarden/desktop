use anyhow::{anyhow, Result};
use widestring::{U16CString, U16String};
use windows::Win32::{
    Foundation::{GetLastError, ERROR_NOT_FOUND, FILETIME, PWSTR, WIN32_ERROR},
    Security::Credentials::{
        CredDeleteW, CredFree, CredReadW, CredWriteW, CREDENTIALW, CRED_FLAGS,
        CRED_PERSIST_ENTERPRISE, CRED_TYPE_GENERIC,
    },
};

const CRED_FLAGS_NONE: u32 = 0;

pub fn get_password<'a>(service: &str, account: &str) -> Result<String> {
    let target_name = U16CString::from_str(target_name(service, account))?;

    let mut credential: *mut CREDENTIALW = std::ptr::null_mut();
    let credential_ptr = &mut credential;

    let result = unsafe {
        CredReadW(
            PWSTR(target_name.as_ptr()),
            CRED_TYPE_GENERIC.0,
            CRED_FLAGS_NONE,
            credential_ptr,
        )
    };

    scopeguard::defer!({
        unsafe { CredFree(credential as *mut _) };
    });

    if !result.as_bool() {
        return Err(anyhow!(convert_error(unsafe { GetLastError() })));
    }

    let password = unsafe {
        U16String::from_ptr(
            (*credential).CredentialBlob as *const u16,
            (*credential).CredentialBlobSize as usize / 2,
        )
        .to_string_lossy()
    };

    Ok(String::from(password))
}

// Remove this after sufficient releases
pub fn get_password_keytar<'a>(service: &str, account: &str) -> Result<String> {
    let target_name = U16CString::from_str(target_name(service, account))?;

    let mut credential: *mut CREDENTIALW = std::ptr::null_mut();
    let credential_ptr = &mut credential;

    let result = unsafe {
        CredReadW(
            PWSTR(target_name.as_ptr()),
            CRED_TYPE_GENERIC.0,
            CRED_FLAGS_NONE,
            credential_ptr,
        )
    };

    scopeguard::defer!({
        unsafe { CredFree(credential as *mut _) };
    });

    if !result.as_bool() {
        return Err(anyhow!(unsafe { GetLastError() }.0.to_string()));
    }

    let password = unsafe {
        std::str::from_utf8_unchecked(std::slice::from_raw_parts(
            (*credential).CredentialBlob,
            (*credential).CredentialBlobSize as usize,
        ))
    };

    Ok(String::from(password))
}

pub fn set_password(service: &str, account: &str, password: &str) -> Result<()> {
    let target_name = U16CString::from_str(target_name(service, account))?;
    let user_name = U16CString::from_str(account)?;
    let last_written = FILETIME {
        dwLowDateTime: 0,
        dwHighDateTime: 0,
    };

    let credential = U16CString::from_str(password)?;
    let credential_len = password.len() as u32 * 2;

    let credential = CREDENTIALW {
        Flags: CRED_FLAGS(CRED_FLAGS_NONE),
        Type: CRED_TYPE_GENERIC,
        TargetName: PWSTR(target_name.as_ptr()),
        Comment: PWSTR::default(),
        LastWritten: last_written,
        CredentialBlobSize: credential_len,
        CredentialBlob: credential.as_ptr() as *mut u8,
        Persist: CRED_PERSIST_ENTERPRISE,
        AttributeCount: 0,
        Attributes: std::ptr::null_mut(),
        TargetAlias: PWSTR::default(),
        UserName: PWSTR(user_name.as_ptr()),
    };

    let result = unsafe { CredWriteW(&credential, 0) };
    if !result.as_bool() {
        return Err(anyhow!(unsafe { GetLastError() }.0.to_string()));
    }

    Ok(())
}

pub fn delete_password(service: &str, account: &str) -> Result<()> {
    let target_name = U16CString::from_str(target_name(service, account))?;

    unsafe {
        CredDeleteW(
            PWSTR(target_name.as_ptr()),
            CRED_TYPE_GENERIC.0,
            CRED_FLAGS_NONE,
        )
        .ok()?
    };

    Ok(())
}

fn target_name(service: &str, account: &str) -> String {
    format!("{}/{}", service, account)
}

// Convert the internal WIN32 errors to descriptive messages
fn convert_error(code: WIN32_ERROR) -> String {
    match code {
        ERROR_NOT_FOUND => String::from("Password not found."),
        _ => code.0.to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test() {
        scopeguard::defer!(delete_password("BitwardenTest", "BitwardenTest").unwrap_or({}););
        set_password("BitwardenTest", "BitwardenTest", "Random").unwrap();
        assert_eq!(
            "Random",
            get_password("BitwardenTest", "BitwardenTest").unwrap()
        );
        delete_password("BitwardenTest", "BitwardenTest").unwrap();

        // Ensure password is deleted
        match get_password("BitwardenTest", "BitwardenTest") {
            Ok(_) => panic!("Got a result"),
            Err(e) => assert_eq!("Password not found.", e.to_string()),
        }
    }

    #[test]
    fn test_get_password_keytar() {
        scopeguard::defer!(delete_password("BitwardenTest", "BitwardenTest").unwrap_or({}););
        keytar::set_password("BitwardenTest", "BitwardenTest", "HelloFromKeytar").unwrap();
        assert_eq!(
            "HelloFromKeytar",
            get_password_keytar("BitwardenTest", "BitwardenTest").unwrap()
        );
    }

    #[test]
    fn test_error_no_password() {
        match get_password("BitwardenTest", "BitwardenTest") {
            Ok(_) => panic!("Got a result"),
            Err(e) => assert_eq!("Password not found.", e.to_string()),
        }
    }
}
