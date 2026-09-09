//! Delivers files dropped on the Dock icon (or opened via "Open With") to the
//! frontend. macOS can send `RunEvent::Opened` before the webview has a
//! listener attached — most commonly on a cold launch, where the drop is what
//! spawns the process in the first place — so requests are queued here and
//! pulled by the frontend once it's ready, rather than only pushed via event.

use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, Runtime, State, Url};
use tauri_plugin_fs::FsExt;

/// Emitted after a new request is queued, to prompt an already-running
/// frontend to call [`take_pending_opens`] promptly. Startup delivery doesn't
/// depend on this: the frontend also drains the queue once it has hydrated,
/// independent of whether this event was received.
pub const DOCK_OPEN_PENDING_EVENT: &str = "dock-open-pending";

/// One entry per `RunEvent::Opened` delivery (i.e. one Dock drop), each holding
/// the file paths from that single drop in the order macOS supplied them.
#[derive(Default)]
pub struct PendingOpens(Mutex<Vec<Vec<String>>>);

impl PendingOpens {
    fn push(&self, paths: Vec<String>) {
        if paths.is_empty() {
            return;
        }
        self.0.lock().unwrap().push(paths);
    }

    fn take_all(&self) -> Vec<Vec<String>> {
        std::mem::take(&mut self.0.lock().unwrap())
    }
}

/// Decodes a `file://` URL into an absolute path, discarding any other scheme
/// (e.g. an `http://` URL passed to `open -a`).
fn url_to_path(url: &Url) -> Option<String> {
    if url.scheme() != "file" {
        return None;
    }
    url.to_file_path()
        .ok()
        .map(|p| p.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn take_pending_opens(pending: State<PendingOpens>) -> Vec<Vec<String>> {
    pending.take_all()
}

/// Handles a macOS `RunEvent::Opened`: grants read/watch access to the exact
/// dropped paths (they may be outside the `$HOME/**` fs scope), queues the
/// request, restores the window, and pings any listening frontend.
pub fn handle_opened<R: Runtime>(app_handle: &AppHandle<R>, urls: Vec<Url>) {
    let paths: Vec<String> = urls.iter().filter_map(url_to_path).collect();
    if paths.is_empty() {
        return;
    }

    let fs_scope = app_handle.fs_scope();
    for path in &paths {
        let _ = fs_scope.allow_file(path);
    }

    app_handle.state::<PendingOpens>().push(paths);

    if let Some(window) = app_handle.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }

    let _ = app_handle.emit(DOCK_OPEN_PENDING_EVENT, ());
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn take_all_drains_in_insertion_order() {
        let pending = PendingOpens::default();
        pending.push(vec!["/tmp/a.txt".into()]);
        pending.push(vec!["/tmp/b.txt".into(), "/tmp/c.txt".into()]);

        assert_eq!(
            pending.take_all(),
            vec![
                vec!["/tmp/a.txt".to_string()],
                vec!["/tmp/b.txt".to_string(), "/tmp/c.txt".to_string()],
            ]
        );
    }

    #[test]
    fn take_all_empties_the_queue() {
        let pending = PendingOpens::default();
        pending.push(vec!["/tmp/a.txt".into()]);
        pending.take_all();

        assert!(pending.take_all().is_empty());
    }

    #[test]
    fn push_ignores_empty_requests() {
        let pending = PendingOpens::default();
        pending.push(vec![]);

        assert!(pending.take_all().is_empty());
    }

    #[test]
    fn url_to_path_decodes_percent_encoding() {
        let url = Url::parse("file:///Users/alex/My%20File.txt").unwrap();
        assert_eq!(url_to_path(&url), Some("/Users/alex/My File.txt".to_string()));
    }

    #[test]
    fn url_to_path_rejects_non_file_scheme() {
        let url = Url::parse("https://example.com/a.txt").unwrap();
        assert_eq!(url_to_path(&url), None);
    }
}
