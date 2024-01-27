import { Client } from 'tplink-smarthome-api';
import * as PromClient from 'prom-client';

// Setup prom-client
const register = new PromClient.Registry();

// Setup a guage for power usage
const powerGauge = new PromClient.Gauge({
  name: 'device_energy_usage',
  help: 'metric_help',
  labelNames: ['host', 'name'],
});
register.registerMetric(powerGauge);
const runningGauge = new PromClient.Gauge({
  name: 'device_powered_on',
  help: 'metric_help',
  labelNames: ['host', 'name'],
});
register.registerMetric(runningGauge);

// config
const config = {
  hosts: process.env.HOSTS?.split(',') ?? [],
}

// setup power capture
const client = new Client();

const devices = await Promise.all(config.hosts.map(async (host) => ({ host, client: await client.getDevice({ host })})));


setInterval(async () => {
  devices.forEach(async (device) => {
    const info = await device.client.getInfo();
    const sysInfo = info.sysInfo as {alias: string, relay_state?: number, light_state?: { on_off: number }};
    const emeter = info.emeter as {realtime: { power: number }};
    powerGauge.labels({ host: device.host, name: sysInfo.alias }).set(emeter.realtime.power);
    runningGauge.labels({ host: device.host, name: sysInfo.alias }).set(sysInfo.relay_state ?? sysInfo.light_state?.on_off ?? 0);
  })
}, 1000);

Bun.serve({
  fetch: async (req) => {
    const url = new URL(req.url);
    switch (url.pathname) {
      case ('/metrics'): {
        const metrics = await register.metrics();
        return new Response(metrics, { headers: {'Content-Type': register.contentType } });
      }
    }
    return new Response("Bun!");
  },
});
