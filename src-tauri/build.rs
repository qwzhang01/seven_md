use std::env;
use std::process::Command;

fn main() {
    // Set Windows-specific build environment variables
    if env::var("CARGO_CFG_WINDOWS").is_ok() {
        println!("cargo:rustc-env=WIN_ARCH=x86_64");
        println!("cargo:rustc-env=WIN_TARGET=x86_64-pc-windows-msvc");
        
        // Set Windows SDK paths if available
        if let Ok(sdk_path) = env::var("WindowsSdkDir") {
            println!("cargo:rustc-env=WINDOWS_SDK_DIR={}", sdk_path);
        }
        
        if let Ok(include_path) = env::var("INCLUDE") {
            println!("cargo:rustc-env=WINDOWS_INCLUDE_PATH={}", include_path);
        }
    }
    
    // Run tauri-build
    tauri_build::build();
}