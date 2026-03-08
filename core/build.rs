fn main() {
    #[cfg(feature = "ffi")]
    {
        uniffi::generate_scaffolding("uniffi/aides.udl").unwrap();
    }
}
