// Phase 1: shell only. Agent adapters and persistence come in later phases.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running The Atelier");
}
