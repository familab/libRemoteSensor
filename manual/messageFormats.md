Message Formats
================

# Status

## 0x00 - BEACON

UDP broadcast on port 6000 (default) that contains:

* Message Type: hex, 1 byte
* Sensor Type: hex, 1 byte
* Uptime: hex, Number of milliseconds since the sensor came started (unsigned long), 4 bytes
* Status: hex, 1 byte

Example:

* Beacon Message Type: 00
* BaseSensor Type: 00
* Uptime: 000003e8
* Ready Status: 00

```
00 00 000003e8 00
```

# Events

## 0xA0 - ISO14443A_CARD_READ

UDP broadcast on port 6000 (default) that contains:

* Message Type: hex, 1 byte
* UID Length: hex, 1 byte
* UID: hex, up to 7 bytes

Example:

* Message Type: A0
* UID Length: 04
* UID: FFAC32F4

```
A0 04 FFAC32F4
```

# Commands

## 0xD0 - ANIMATE

Upon receiving this command the sensor should play the animation defined by this id.

UDP packet sent to sensor that contains:

* Message Type: hex, 1 byte
* Animation ID: hex, 1 byte

Example:

* Message Type: D0
* Animation ID: 04

```
D0 04
```

## 0xFF - RESET

Upon receiving this command the sensor should reboot/reset as best as its platform supports.

UDP packet sent to sensor that contains:

* Message Type: hex, 1 byte

Example:

* Message Type: FF

```
FF
```
