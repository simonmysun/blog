---
layout: post
title: Monitoring Infrastructure Deployment
language: en-DE
place: Trieste, Italia
---

# Monitoring Infrastructure Deployment

Note: This is a collection of notes taken during improvements on the observability of my services.

In order to monitor the running status of various services on the servers (as well as local machines) in real time to ensure the stability and security of the services, I have deployed a monitoring system with Prometheus Loki Grafana stack. 
Availabe data sources include logs, metrics, and traces. 
For now, tracing is not in the scope because most of the services are not maintained by me, so I'm not interested in the tracing data. 
Tracing will be enabled on-demand when I need to debug a specific software and will not be included in my monitoring infrastructure. 
In the future when this reuqirement is reassessed, a tracing platform will be hopefully easily added to the existing monitoring infrastructure as another data source of grafana.

Metrics are collected with pull model, and logs are collected with push model. 
This is according to the design of Prometheus and Loki. 

The system consists of the following components:

## Fundamental Components

```plaintext
    ***************                   ***************    
    *             *                   *             *    
    *   Logs &    *                   *   Metrics   *    
    *  Journals   *                   *  Exporters  *    
    *             *                   *             *    
    ***************                   ***************    
           │                                 │           
           │                                 │           
           │                                 │           
┌──────────┴──────────┐           ┌──────────┴──────────┐
│                     │           │                     │
│        Loki         │           │     Prometheus      │
│  (Log Aggregation)  │     ┌─────┤(Metrics Aggregation)│
│                     │     │     │                     │
└──────────┬──────────┘     │     └──────────┬──────────┘
           │                │                │           
           │                │                │           
           │                │                │           
┌──────────┴──────────┐     │     ┌──────────┴──────────┐
│                     │     │     │                     │
│       Grafana       ├─────┘     │    Alertmanager     │
│    (Visualization)  │           │   (Alert Routing)   │
│                     │           │                     │
└─────────────────────┘           └──────────┬──────────┘
                                             │           
                                             │           
                                             │           
                                  +++++++++++++++++++++++
                                  +                     +
                                  +Notification Channels+
                                  +   (e.g. Email)      +
                                  +                     +
                                  +++++++++++++++++++++++
```

The core components are demonstrated in the diagram above, bringing logs and metrics to the users via visualizations and alerts. 
Loki receives logs and journals from promtail and Prometheus scrapes metrics from the exporters. 
Grafana visualizes the data from Loki and Prometheus, and Alertmanager routes alerts to the notification channels.

All the components are deployed in docker containers, and the deployment is managed by docker-compose. 
In case of interest, all the web endpoints are routed through traefik reverse proxy with HTTPS enabled.

### Prometheus

Prometheus serves as different roles in the monitoring infrastructure. 
It is responsible for scraping metrics from the exporters, storing the metrics, providing a query language for users to query the metrics and trigger alerts. 

In the current setup, an extra route is added to enable Prometheus to scrape exporters from the wireguard network. This requires: 

- The Prometheus container should be able to access the wireguard network.
- The container needs `CAP_NET_ADMIN` capability and an IP route to wireguard interface is required.

See [previous blog post](https://maoyin.eu/blog/2024/01/20/docker-with-wireguard.html#add-a-route-for-the-prometheus-container-to-the-bridging-subnet) for more details.

Remote write receiver is also enabled with authentication to receive metrics from prometheus instances outside the wireguard network but without a public IP address. 
To achieve this:

- Prometheus is configured to start with `--web.enable-remote-write-receiver` flag.
- A basic authentication middleware is added to the traefik configuration to protect the remote write endpoint:

```yaml
    labels:
      - traefik.enable=true
      - traefik.http.routers.monitoring_prometheus.rule=Host(`<HOSTNAME>`) && PathPrefix(`/api/v1/write`)
      - traefik.http.services.monitoring_prometheus.loadbalancer.server.port=9090
      - traefik.http.middlewares.monitoring_prometheus-auth.basicauth.users=<REDACTED>
      - traefik.http.middlewares.monitoring_prometheus-auth.basicauth.removeheader=true
      - traefik.http.routers.monitoring_prometheus.middlewares=monitoring_prometheus-auth@docker
      - traefik.docker.network=monitoring_default
```

Alert rules are defined in the `prometheus.yml` file and mounted to the container. 
The alert rules are written in PromQL and are evaluated at the interval specified in the rule. 
When an alert is triggered, it is sent to the Alertmanager. 
Most of the current alert rules are selected from https://samber.github.io/awesome-prometheus-alerts/ and modified to fit the specific use case. 
However, because some metrics exporters are written by myself, I need to write alert rules for them.

### Alertmanager

Alertmanager is responsible for routing alerts to the notification channels. 
It receives alerts from Prometheus and routes them to the configured notification channels. 

Though this is a setup majorly for a personal use, there are several services running for external purposes. 
Therefore, the alertmanager is configured with multiple routes and receivers. 

Inhibit rules are also defined to prevent alert storms. 
This is currently not perfect due to the lack of accidents. 
In the future, it should be improved by conducting disaster drills.

### Loki

Loki is a log aggregation system that passively collects logs from promtail and stores them in a ~~distributed~~ storage (Currently, it is stored in a local volume). 
It is designed to be used with Grafana for visualization. 
Setting up Loki is relatively easy.
But to persist the logs locally, correct volume binds are required.
However this is ambiguous in the official documentation or even the code.
There are `/loki` and `/tmp/loki` directories and it seems that there was a [migration](https://github.com/grafana/loki/pull/1834/commits/7af270401781decdb7393dc439fbee1a37c1f358).
But I still see logs in `/tmp/loki` directory.
I currently don't want to dig into this and simply mounted the both directories.

When Promtail is started the first time, Loki might ingest too much data and shout HTTP 429. 
To avoid this, the default limits config needs to be modified. 
See [this issue](https://github.com/grafana/loki/issues/4204)
For now I don't see any problem with the enlarged limits, so I will keep it this way.

Alerting on logs is not enabled yet. In the future I will add it according to https://samber.github.io/awesome-prometheus-alerts/rules#loki

### Grafana

Grafana is a visualization tool that connects to Prometheus and Loki to visualize the metrics and logs. 
It is also responsible for managing alerts and notification channels, which is currently not used in my setup.

Dashboards and data sources are provisioned with the `grafana.ini` and `provisioning` directory. This is a good practice to keep the configuration in version control.

Some dashboards requires plugins to be installed. This is done with the `grafana-cli` command.

## Data Collectors

Upon the fundamental components, there are several data collectors deployed to collect metrics from different sources. Promtail is the only log collector deployed for now. Others are metric collectors.

The data collectors are deployed as docker containers on powerful machines and as systemd services on the edge devices. To avoid the metrics or logs exposed to the public internet, they are configured to listen to their IP of the wireguard network: 

- Most exporters support `--web.listen-address` flag to specify the listening address, i.e. `-web.listen-address [fd00:1::2:<internal-ip-suffix>]:<port>`.
- Containers publishes the ports to the wireguard network only as specified in docker compose file: 

```yaml
    ports:
      - "[fd00:1::2:<internal-ip-suffix>]:<port>:<port>"
```

In order to start the exporter or the docker daemon systemd units, adding `After=wg-quick@wg0.service` and `Requires=sys-devices-virtual-net-wg0.device` under `[Unit]` section in an override file via `systemctl edit <unit>.service` is required to change the order. 

### Promtail

Promtail collects logs and sends to Loki. 
Its descriptive name symbolizes that it outputs new lines of logs like the `tail` command and can be configured just like Prometheus. 

In my setup, `/var/log` and `/var/lib/docker/containers` are mounted to the promtail container. This includes systemd journal, and all the logs of the services running on the host machine as well as the docker container logs.

To fit the logs into the Loki format, services are required to log in JSON format.
Not all services log in JSON format, so the logs need to be relabeled on demand.

Systemd journal logs needs to be relabled to get the unit names indexed in Loki:

```yaml
  relabel_configs:
    - source_labels: ["__journal__systemd_unit"]
      target_label: "unit"
```

Docker logs also needs to be adjusted.
In `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "labels-regex": "^.+",
  }
}
```

This will expose `com.docker.*` labels in the logs, which can be used to relabel the logs in promtail:

```yaml
  pipeline_stages:
  - json:
      expressions:
        log: log
        stream: stream
        time: time
        tag: attrs.tag
        compose_project: attrs."com.docker.compose.project"
        compose_service: attrs."com.docker.compose.service"
        stack_name: attrs."com.docker.stack.namespace"
        swarm_service_name: attrs."com.docker.swarm.service.name"
        swarm_task_name: attrs."com.docker.swarm.task.name"
  - regex:
      expression: "^/var/lib/docker/containers/(?P<container_id>.{12}).+/.+-json.log$"
      source: filename
  - timestamp:
      format: RFC3339Nano
      source: time
  - labels:
      stream:
      container_id:
      tag:
      compose_project:
      compose_service:
      stack_name:
      swarm_service_name:
      swarm_task_name:
  - output:
      source: log
```

This is from https://gist.github.com/ruanbekker/c6fa9bc6882e6f324b4319c5e3622460?permalink_comment_id=4327203#gistcomment-4327203

Note that containers needs to be recreated to apply the changes. Restarting the docker daemon and / or the containers is not enough.

### node-exporter

Node-exporter is deployed on all the machines to expose system metrics. It's robustness and simplicity makes it even a good alternative to check if the machine is up. 

However, on edge devices, e.g. single-board computers, some metric collectors are too heavy to run. 
The least resource device I have is a Raspberry Pi 1B, which suffers from the high CPU usage of the node-exporter with default configuration.
It is running a Raspbian Bookworm. 
The `prometheus-node-exporter` package is installed from the official repository, which has a Debian patch to enable systemd collector by default (https://salsa.debian.org/go-team/packages/prometheus-node-exporter/-/blob/debian/sid/debian/patches/0001-Debian-defaults.patch?ref_type=heads#L103-104). 
Additionally, if `prometheus-node-exporter-collectors` is installed, there will be `/usr/lib/systemd/system/prometheus-node-exporter-apt.service` and `/usr/lib/systemd/system/prometheus-node-exporter-apt.timer` (https://packages.debian.org/sid/all/prometheus-node-exporter-collectors/filelist) which will consume horrible amount of CPU due to short of RAM. 
So `--no-collector.systemd` should be appended and `prometheus-node-exporter-collectors` should be removed in limited resource devices.

### cAdvisor

cAdvisor is a container monitoring tool that expose resource usage and performance characteristics of the containers. Running cAdvisor inside container is very convenient, except that it needs SYS_ADMIN capability to access the host's cgroup. 

One issue I encountered is that the docker image tag `latest` does not actually points to the latest version: https://github.com/google/cadvisor/pull/2413

cAdvisor enables me to see the resource usage of each container, and I can decide whether to move a service to another machine. 

There are plenty of dashboards available for cAdvisor, but I decided to create my own dashboard at last: https://grafana.com/grafana/dashboards/19792-cadvisor-dashboard/ which provides both an overview of multiple services and a detailed view each service.

### blackbox-exporter

This was initally on request of a friend who wanted to monitor the availability of their website. I wrote a simple exporter which sends a HTTP GET request to the specified URL and expose metrics of the entire HTTP connection. Later I found the blackbox-exporter from the official Prometheus repository has covered most of the metrics I need, so I switched to it. Blackbox-exporter is usually good enough to tell if a service is up or down. A status page is made with its metrics with the help of Grafana. 

### ping-exporter

I deployed ping-exporter on all my devices to monitor the connectivity and availability. 
It sends ICMP echo requests to each other and expose the metrics of the statistics of ICMP connections. 
The devices in my network locate in three different continents. 
The historical data shows very interesting patterns of the network conditions and I can easily tell the topological distances between the devices.  

### Other Exporters on specific devices

- nvidia/dcgm-exporter: Nvidia GPU monitoring
- smartctl-exporter: Disk health monitoring
- opcm/pcm: Intel CPU monitoring

I have ocassionally observed PCM consumes a lot of CPU when the machine wakes up from sleep.
I haven't confirmed this. 
But since I'm not doing any CPU intensive tasks, it is disabled by default.

## Summary

Adding observability to the services is the first item on my checklist of the service deployment. 
A robust monitoring infrastructure is essential to ensure the stability and security of the services, and to provide insights for further improvements.
We should not be afraid of drowning in the ocean of logs and metrics.

