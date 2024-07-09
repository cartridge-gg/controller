use wasm_bindgen::{JsError, JsValue};

pub(crate) mod call;
pub(crate) mod estimate;
pub(crate) mod invocation;
pub(crate) mod outside_execution;
pub(crate) mod policy;
pub(crate) mod session;

pub(crate) trait TryFromJsValue<T> {
    fn try_from_js_value(value: JsValue) -> Result<T, JsError>;
}
