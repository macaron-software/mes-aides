// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MesAides",
    platforms: [.iOS(.v16)],
    products: [
        .library(name: "MesAidesCore", targets: ["MesAidesCore"]),
        .library(name: "MesAides", targets: ["MesAides"]),
    ],
    dependencies: [],
    targets: [
        // UniFFI-generated Swift bindings for the Rust core lib
        // Build the .xcframework from `cargo build --target aarch64-apple-ios`
        // then run `uniffi-bindgen generate --language swift core/uniffi/aides.udl`
        .binaryTarget(
            name: "AidesCoreFFI",
            path: "Frameworks/AidesCoreFFI.xcframework"
        ),
        .target(
            name: "MesAidesCore",
            dependencies: ["AidesCoreFFI"],
            path: "Sources/MesAidesCore"
        ),
        .target(
            name: "MesAides",
            dependencies: ["MesAidesCore"],
            path: "Sources/MesAides"
        ),
    ]
)
