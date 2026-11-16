// Phase 7 (partial): the app writes each command to commands/inbox.jsonl in the
// repo and pushes it, so the agent side can read it from git.
// Needs the environment variable ATELIER_REPO set to the local clone's folder.
use std::fs::OpenOptions;
use std::io::Write;
use std::path::PathBuf;
use std::process::Command;

fn repo_dir() -> Result<PathBuf, String> {
    std::env::var("ATELIER_REPO")
        .map(PathBuf::from)
        .map_err(|_| "ATELIER_REPO is not set. Point it at the atelier folder.".to_string())
}

fn run_git(dir: &PathBuf, args: &[&str]) -> Result<(), String> {
    let out = Command::new("git")
        .current_dir(dir)
        .args(args)
        .output()
        .map_err(|e| format!("could not run git: {e}"))?;
    if out.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&out.stderr).trim().to_string())
    }
}

#[tauri::command]
fn queue_command(line: String) -> Result<String, String> {
    if line.contains('\n') || line.len() > 4000 {
        return Err("command must be a single line under 4000 characters".into());
    }
    let dir = repo_dir()?;
    let inbox = dir.join("commands").join("inbox.jsonl");
    std::fs::create_dir_all(inbox.parent().unwrap()).map_err(|e| e.to_string())?;
    let mut f = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&inbox)
        .map_err(|e| e.to_string())?;
    writeln!(f, "{line}").map_err(|e| e.to_string())?;
    drop(f);
    run_git(&dir, &["add", "commands/inbox.jsonl"])?;
    run_git(
        &dir,
        &[
            "-c", "user.name=Atelier App",
            "-c", "user.email=app@atelier.local",
            "commit", "-m", "Command queued from the Atelier app",
        ],
    )?;
    run_git(&dir, &["push", "origin", "main"])?;
    Ok("sent".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![queue_command])
        .run(tauri::generate_context!())
        .expect("error while running The Atelier");
}
