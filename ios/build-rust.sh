#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Building Rust core for iOS targets..."
cargo build --features ffi -p aides-core --release --target aarch64-apple-ios
cargo build --features ffi -p aides-core --release --target aarch64-apple-ios-sim

echo "==> Generating Swift bindings..."
mkdir -p ios/MesAides/Sources/MesAidesCore
uniffi-bindgen generate \
  --library target/aarch64-apple-ios/release/libaides_core.dylib \
  --language swift \
  --out-dir ios/MesAides/Sources/MesAidesCore/

echo "==> Creating XCFramework..."
rm -rf ios/AidesCoreFFI.xcframework

xcodebuild -create-xcframework \
  -library target/aarch64-apple-ios/release/libaides_core.dylib \
  -headers ios/MesAides/Sources/MesAidesCore/ \
  -library target/aarch64-apple-ios-sim/release/libaides_core.dylib \
  -headers ios/MesAides/Sources/MesAidesCore/ \
  -output ios/AidesCoreFFI.xcframework

echo "==> Done. XCFramework at ios/AidesCoreFFI.xcframework"
