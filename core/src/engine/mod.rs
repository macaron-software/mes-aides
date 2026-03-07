pub mod types;
pub mod rules;
pub mod simulator;

pub use types::{Situation, FamilleStatus, LogementStatus, EmploiStatus};
pub use simulator::{Simulator, SimulationResult, AideResult};
