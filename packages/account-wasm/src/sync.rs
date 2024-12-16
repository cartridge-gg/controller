use std::{
    ops::{Deref, DerefMut},
    sync::{Mutex as StdMutex, MutexGuard as StdMutexGuard},
};

use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::js_sys::Function;

/// A mutex implementation backed by JavaScript `Promise`s.
///
/// This type wraps a simple JavaScript `Mutex` implementation but exposes an idiomatic Rust API.
pub struct WasmMutex<T> {
    js_lock: Mutex,
    rs_lock: StdMutex<T>,
}

impl<T> WasmMutex<T> {
    pub fn new(value: T) -> Self {
        Self {
            js_lock: Mutex::new(),
            rs_lock: std::sync::Mutex::new(value),
        }
    }

    pub async fn lock(&self) -> WasmMutexGuard<T> {
        WasmMutexGuard {
            js_release: self.js_lock.obtain().await,
            // This never actually blocks as it's guarded by the JS lock. This field exists only to
            // provide internal mutability for the underlying value.
            rs_guard: self.rs_lock.lock().unwrap(),
        }
    }
}

/// A handle to the underlying guarded value. The lock is released when the instance is dropped.
pub struct WasmMutexGuard<'a, T> {
    js_release: Function,
    rs_guard: StdMutexGuard<'a, T>,
}

impl<T> Deref for WasmMutexGuard<'_, T> {
    type Target = T;

    fn deref(&self) -> &T {
        std::sync::MutexGuard::deref(&self.rs_guard)
    }
}

impl<T> DerefMut for WasmMutexGuard<'_, T> {
    fn deref_mut(&mut self) -> &mut T {
        std::sync::MutexGuard::deref_mut(&mut self.rs_guard)
    }
}

impl<T> Drop for WasmMutexGuard<'_, T> {
    fn drop(&mut self) {
        self.js_release.call0(&JsValue::null()).unwrap();
    }
}

#[wasm_bindgen(module = "/src/wasm-mutex.js")]
extern "C" {
    type Mutex;

    #[wasm_bindgen(constructor)]
    fn new() -> Mutex;

    #[wasm_bindgen(method)]
    async fn obtain(this: &Mutex) -> Function;
}
