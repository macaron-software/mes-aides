pub mod engine;
pub mod aides;
pub mod i18n;
pub mod datagouv;

pub use engine::{Simulator, Situation, SimulationResult};
pub use aides::{AideId, Categorie};

#[cfg(feature = "wasm")]
pub mod wasm_bindings;

#[cfg(feature = "ffi")]
pub mod ffi;

#[cfg(feature = "ffi")]
uniffi::setup_scaffolding!();
