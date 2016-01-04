# libRemoteSensor
Library to communicate with Remote Sensors

This Library is designed to be used inside other apps to enable communication with our standardized remote sensors. These include NFC Readers, Amp Sensors, Temperature and Humidity Sensors and Buttons. All of these sensors communicate via udp4 and speak a common network protocol.

Planned Methods:

* autoDiscover([ip], [port], [callback]) - binds to this address and listens for sensor beacons
* defineType(type, parseFunction, sendHandler) - defines or overrides a built in type with a custom parse function or send handler.
* setup(sensorDefinition) - creates listener and event bindings to manage a sensor. Will replace a sensor with the same name.
* setup([sensorDefinitions]) - same as above for for entire array.
* teardown(sensorName) - will remove the listener and event bindings to a sensor.
* teardown([sensorNames]) - same as above for for entire array.
* teardownAll() - will remove all listeners and event bindings except auto discover.
* stop() - will remove all listeners and event bindings.
* send(sensorName, data) - sends data via send handler to sensor.

sensorDefinition:

  * name: string,
  * address: ipv4 address,
  * port: int (1-65535),
  * type: string,
  * parseFunction: function (optional),
  * sendHandler: function (optional)


Default Functionality supported by send handler:

* reset

Default Functionality supported by parser:

* TBD


## Commands

* test
`npm test`

* Generate Documentation
`npm run-script gendocs`
