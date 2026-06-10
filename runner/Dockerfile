# syntax=docker/dockerfile:1

# ---- Build the Go service ----
FROM golang:1.26-bookworm AS build
WORKDIR /src
# The embedded questions/ tree and the source are all that's needed; there
# is no module dependency graph to prefetch.
COPY go.mod ./
COPY *.go ./
COPY questions ./questions
ENV CGO_ENABLED=0
RUN go build -trimpath -ldflags="-s -w" -o /out/runner .

# ---- Runtime: JDK + bubblewrap, no build tooling ----
FROM eclipse-temurin:21-jdk-jammy

# bubblewrap provides the per-request namespace sandbox; util-linux provides
# prlimit; tini reaps zombies left by killed submissions. ca-certificates is
# only for the service's own outbound needs (none today, kept minimal).
RUN apt-get update \
    && apt-get install -y --no-install-recommends bubblewrap util-linux tini curl \
    && rm -rf /var/lib/apt/lists/*

# Unprivileged service account. Untrusted code runs as this same uid inside
# the bubblewrap namespaces; it never runs as root.
RUN useradd --system --create-home --uid 10001 --shell /usr/sbin/nologin runner

COPY --from=build /out/runner /usr/local/bin/runner

ENV JAVA_HOME=/opt/java/openjdk \
    SANDBOX_MODE=bwrap \
    PORT=8080 \
    RUNNER_WORK_DIR=/work

# Dedicated scratch root for per-request work dirs, owned by the service user.
RUN mkdir -p /work && chown runner:runner /work
VOLUME ["/work"]

USER runner
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8080/healthz || exit 1

ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/runner"]
