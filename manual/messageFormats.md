Message Formats
================

## Heartbeat / Beacon

UDP broadcast on port 6000 (default) that contains:

* Message Type: hex, 1 byte
* Sensor Type: hex, 1 byte
* Uptime: hex, Number of milliseconds since the sensor came started (unsigned long), 4 bytes
* Status: hex, 1 byte

Example:

Beacon Message Type: 00
BaseSensor Type: 00
Uptime: 000003e8
Ready Status: 00

```
00 00 000003e8 00
```
