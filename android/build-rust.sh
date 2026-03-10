#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

TARGETS=(
    "aarch64-linux-android:arm64-v8a"
    "armv7-linux-androideabi:armeabi-v7a"
    "x86_64-linux-android:x86_64"
)

echo "==> Building Rust core for Android targets..."
for entry in "${TARGETS[@]}"; do
    target="${entry%%:*}"
    abi="${entry##*:}"
    echo "    $target -> $abi"
    cargo build --features ffi -p aides-core --release --target "$target"
    mkdir -p "android/app/src/main/jniLibs/$abi"
    cp "target/$target/release/libaides_core.so" "android/app/src/main/jniLibs/$abi/"
done

echo "==> Generating Kotlin bindings..."
mkdir -p android/app/src/main/kotlin/uniffi
uniffi-bindgen generate \
    --library target/aarch64-linux-android/release/libaides_core.so \
    --language kotlin \
    --out-dir /tmp/uniffi-kotlin-gen/ \
    --no-format

# Move generated file to correct location
find /tmp/uniffi-kotlin-gen -name "aides_core.kt" -exec cp {} android/app/src/main/kotlin/uniffi/aides_core.kt \;
rm -rf /tmp/uniffi-kotlin-gen

echo "==> Done. JNI libs and Kotlin bindings ready."
