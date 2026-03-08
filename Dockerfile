# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM rust:alpine AS builder

WORKDIR /build

# Alpine is already musl — compile natively, no cross needed
RUN apk add --no-cache musl-dev pkgconfig openssl-dev openssl-libs-static

# Cache dependencies
COPY Cargo.toml Cargo.lock ./
COPY core/Cargo.toml core/Cargo.toml
COPY api/Cargo.toml  api/Cargo.toml
RUN mkdir -p core/src api/src && \
    echo "fn main(){}" > api/src/main.rs && \
    touch core/src/lib.rs

RUN cargo fetch --locked

# Copy real source
COPY core/ core/
COPY api/  api/

# Build static release binary
ENV OPENSSL_STATIC=1
RUN cargo build --release --package aides-api

# ── Stage 2: minimal runtime image ──────────────────────────────────────────
FROM alpine:3.20 AS runtime

RUN apk add --no-cache ca-certificates

COPY --from=builder /build/target/release/aides-api /usr/local/bin/aides-api

RUN adduser -D -s /bin/false aides
USER aides

ENV PORT=3001
EXPOSE 3001

ENTRYPOINT ["/usr/local/bin/aides-api"]
