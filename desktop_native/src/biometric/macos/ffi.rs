#![allow(non_upper_case_globals)]

use core_foundation::{
    base::{CFAllocatorRef, CFTypeID, CFTypeRef},
    string::CFStringRef,
};

pub type SecAccessControlRef = CFTypeRef;
pub type SecAccessControlCreateFlags = u32;
pub static kSecAccessControlBiometryAny: u32 = 1 << 1;
// pub static kSecAccessControlWatch: u32 = 1 << 5;

#[link(name = "Security", kind = "framework")]
extern "C" {
    pub static kSecAttrAccessControl: CFStringRef;
    pub static kSecAttrAccessibleWhenUnlockedThisDeviceOnly: CFStringRef;

    pub fn SecAccessControlCreateWithFlags(
        allocator: CFAllocatorRef,
        protection: CFTypeRef,
        flags: SecAccessControlCreateFlags,
        error: *mut CFTypeRef,
    ) -> CFTypeRef;
    pub fn SecAccessControlGetTypeID() -> CFTypeID;
}
