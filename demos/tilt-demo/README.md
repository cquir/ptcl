
## Instructions


### Get the connection URL so you can run this on your phone

Find your local machine's IP using:
```bash
ip a
```

In my case my desktop was allocated the DHCP ip of 192.168.2.17 as found via this entry:
```
4: wlp5s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 3c:f0:11:d9:e1:71 brd ff:ff:ff:ff:ff:ff
    inet 192.168.2.17/24 brd 192.168.2.255 scope global dynamic noprefixroute wlp5s0
```

This command also works:
```bash
hostname  -I
```

The IP to connect to on your phone is `https://<IP FROM ABOVE>:3000` so for me it's `https://192.168.2.17:3000`.

### Run the dev server

```bash
cd demos/tilt-demo
npm install
npm start
```
