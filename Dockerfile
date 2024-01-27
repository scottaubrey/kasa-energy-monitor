FROM oven/bun:1 as build
WORKDIR /usr/src/app

COPY . .
RUN bun install
RUN bun build --compile --target bun --outfile energy_monitor src/index.ts

FROM debian:12-slim AS release
COPY --from=build --chmod=777 /usr/src/app/energy_monitor /energy_monitor

# run the app
EXPOSE 3000/tcp
ENTRYPOINT [ "/energy_monitor" ]
