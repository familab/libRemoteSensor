Message Formats
================

## Heartbeat / Beacon

UDP broadcast on port 6000 (default) that contains:

* Sensor Type: hex, 1 byte
* Uptime: hex, Number of milliseconds since the sensor came started (unsigned long), 4 bytes
* Status: hex, 1 byte
* Null Terminator

Example:

BaseSensor Type: 00
Uptime: 00000020e
Ready Status: 00

```
00 000000020e 00 00
```
