Message Formats
================

## Heartbeat / Beacon

UDP broadcast on port 6000 (default) that contains:

* Message Type: hex, 2 bytes
* Sensor Type: hex, 2 bytes
* Uptime: hex, Number of milliseconds since the sensor came started (unsigned long), 4 bytes
* Status: hex, 2 bytes
* Null Terminator

Example:

Beacon Message Type: 00
BaseSensor Type: 00
Uptime: 00000020e
Ready Status: 00

```
00 00 000000020e 00 00
```
