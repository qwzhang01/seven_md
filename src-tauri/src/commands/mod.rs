pub mod fs;
pub mod system;

// Re-export all commands for convenient registration in main.rs
pub use fs::{
    read_file, save_file, read_directory, search_in_files,
    create_file, create_directory, rename_path, delete_path,
    export_html, open_folder, start_fs_watch, stop_fs_watch,
    WatcherState,
};
pub use system::{
    get_store_path, update_recent_menu, create_new_window, open_external_url,
    get_git_branch, open_in_terminal, AppHandleState,
};

#[cfg(target_os = "macos")]
pub use system::reveal_in_finder;

#[cfg(target_os = "windows")]
pub use system::reveal_in_explorer;
