# kasa-energy-monitor

This small project bundles a bun runtime with the `tplink-smarthome-api` library to expose realtime power metrics of TP-Link Kasa power plug using `prom-client`.

This may or may not work for you, but if you want to give it a try, clone the repo and run with bun, passing in environment variable of comma separated hosts:

```shell
HOSTS="10.0.1.2,10.0.1.5" bun run -b ./src/index
```

or, run the same as a docker container:

```
docker buildx build . -t energy_monitor
docker run -e HOSTS="10.0.1.2,10.0.1.5" -p3000:3000 energy-monitor
```

Then visit `http://localhost:3000/metrics`
