var sensorLoadOrder = [
  'base',
  'nfc',
];

var sensorTypes = {
  parsers: {},
  handlers: {},
  methods: {},
};

var copyIfDoesntExist = function(obj, destination) {
  Object.keys(obj).forEach(function(type) {
    if (!destination[type]) {
      destination[type] = obj[type];
    }
  });
};

sensorLoadOrder.forEach(function(sensor) {
  var sensorDefinition = require('./' + sensor + '.js');

  sensorTypes[sensorDefinition.typeCode] = sensorDefinition;

  copyIfDoesntExist(sensorDefinition.parsers, sensorTypes.parsers);
  copyIfDoesntExist(sensorDefinition.handlers, sensorTypes.handlers);
  copyIfDoesntExist(sensorDefinition.methods, sensorTypes.methods);
});

module.exports = sensorTypes;
