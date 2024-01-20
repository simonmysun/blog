---
layout: post
title: Docker with Wireguard for routing between Prometheus and exporters
language: en-DE
place: Frankfurt am Main
---

## Why bother

Using Docker with Wireguard is controversial. Docker daemon and Wireguard both manipulate iptables and may conflict with each other. A container without `--cap-add=NET_ADMIN` cannot change its network routes and adding such capabilities is risky. There are several articles on the Internet describing how to route the traffic between containers with Wireguard, e.g.

* https://www.linuxserver.io/blog/routing-docker-host-and-container-traffic-through-wireguard
* https://www.procustodibus.com/blog/2022/02/wireguard-remote-access-to-docker-containers/

In my case, previously I ran a Prometheus container on one of my VPSs and other instances ran Prometheus with agent mode using `remote_write`. This has several problems:

* Prometheus running in agent mode may send metrics with bad timestamps due to hibernation or suspension \[[ref][prometheus-out-of-bound]], even if I don't travel faster than light when my computer sleeps. 
* My Raspberry Pi 1b doesn't have enough resources to run a Prometheus, and it is the only always-on device at my home. 
* The `web.enable-remove-write-receiver` of Prometheus doesn't support authentication and needs another middleware for it.
* One of the virtual machines doesn't have an IPv6 address, and adding IPv6 support for docker is painful. 

[prometheus-out-of-bound]: https://github.com/prometheus/prometheus/issues/8243

But if I somehow let all these instances appear in the same subnet, everything is solved. I have a Wireguard container running so I will simply make use of the existing network.

## Routing the traffic between containers
### Create a bridging subnet with a fixed IP range

***This is not a **Network Bridge**. I might not be doing it in the best way***

I am using a Docker image from linuxserver.io\[[ref][docker-wireguard-image]] which does not expose its Wireguard subnet (`10.13.13.0/24`). Therefore I create another bridging subnet and let both Prometheus and Wireguard containers join it.

[docker-wireguard-image]: https://github.com/linuxserver/docker-wireguard

* In the docker-compose file of the Wireguard container (The IP range is picked arbitrarily as long as it's not engaged, but using a reserved private range is recommended): 

```yaml
networks:
  wg-network:
    ipam:
      driver: default
      config:
        - subnet: 172.25.0.0/16
```

* And add this bridging network to Prometheus and Wireguard services. The Wireguard service needs a fixed IP, therefore in the Wireguard service section (The IP is picked arbitrarily as long as it's not engaged):

```yaml
    networks:
      wg-network:
        ipv4_address: 172.25.0.233
```

Now Prometheus and all the exporters exposed in the Wireguard subnet are somehow connected. But on Prometheus container routes are missing for the Wireguard subnet. 

### Add a route for the Prometheus container to the bridging subnet

In the namespace of the Prometheus container, running

```bash
ip route add 10.13.13.0/24 via 172.25.0.233
```

will route all the traffic to the Wireguard subnet go through `172.25.0.233` which is the IP of the Wireguard Container in the briding subnet. Now we can test connectivity with ping: `ping 10.13.13.1`. However, for now, we cannot connect to other IPs in the `10.13.13.0/24`. That is because we need a NAT in this case. We will cover that in the next chapter. 

The official Prometheus image \[[ref](prometheus-image)] is running Prometheus as user `nobody`. To add a route it should executed with root. Besides, we also need to add `NET_ADMIN` capability to the container. Unfortunately, there are currently no lifecycle hooks available for Docker, so I create a bash script, change the entry point to it, mount it to the container, and add the routing and start Prometheus in this bash script. 

[prometheus-image]: https://hub.docker.com/r/prom/prometheus/

### Add a rule allowing traffic from the bridging subnet to the Wireguard subnet

Fortunately, Wireguard supports lifecycle hooks and we can simply add rules in the Wireguard configuration:

```conf
PostUp = iptables -A FORWARD -i %i -j ACCEPT
PostUp = iptables -A FORWARD -o %i -j ACCEPT
PostUp = iptables -t nat -A POSTROUTING -o eth+ -j MASQUERADE
PreDown = iptables -D FORWARD -i %i -j ACCEPT
PreDown = iptables -D FORWARD -o %i -j ACCEPT
PreDown = iptables -t nat -D POSTROUTING -o eth+ -j MASQUERADE


PostUp = iptables -A FORWARD -i eth+ -j ACCEPT
PostUp = iptables -A FORWARD -o eth+ -j ACCEPT
PostUp = iptables -t nat -A POSTROUTING -o wg+ -j MASQUERADE
PreDown = iptables -D FORWARD -i eth+ -j ACCEPT
PreDown = iptables -D FORWARD -o eth+ -j ACCEPT
PreDown = iptables -t nat -D POSTROUTING -o wg+ -j MASQUERADE
```

TUNA group members suggested adding ctstate ESTABLISHED or NEW can avoid the concern of whether I should add rules for both directions and also suggested using nftables. Will consider it later.

Now we can access the Wireguard peers from the Prometheus container. 

## Misc
### Let exporters listen to the subnet

The exporters on the instances other than the one Prometheus itself running on are now listening to `0.0.0.0:PORT`. I don't want them to be exposed to all the networks, so I change it to its IP in the Wireguard network: `10.13.13.X:PORT`. For exporters running in docker, it can be done during port binding: `10.13.13.X:PORT:PORT`. Now they are not accessible outside the Wireguard network. 

### Start Docker daemon and Prometheus after Wireguard

However, the exporter containers or services failed to start every time I rebooted. This was because they were started before the Wireguard network was ready. 

To ensure exporters start after the Wireguard network is ready, I edited the systemd unit of e.g. docker daemon, adding `After=wg-quick@wg0.service` under `[Unit]` section. 

## Results

Now everything looks better. The exporters are reachable to and only reachable from Wireguard Network. Our security relies on Wireguard and Prometheus. I gave Prometheus container more capabilities than the official recommendation, but since Prometheus is not an exposed service, I am now at ease. 