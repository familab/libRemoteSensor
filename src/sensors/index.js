var sensorLoadOrder = [
  'base',
];

var sensorTypes = {
  parsers: {},
  handlers: {},
};

sensorLoadOrder.forEach(function(sensor) {
  var sensorDefinition = require('./' + sensor + '.js');

  sensorTypes[sensorDefinition.typeCode] = sensorDefinition;
  Object.keys(sensorDefinition.parsers).forEach(function(parserType) {
    if (!sensorTypes.parsers[parserType]) {
      sensorTypes.parsers[parserType] =
        sensorDefinition.parsers[parserType];
    }
  });
  Object.keys(sensorDefinition.handlers).forEach(function(handlerType) {
    if (!sensorTypes.handlers[handlerType]) {
      sensorTypes.handlers[handlerType] =
        sensorDefinition.handlers[handlerType];
    }
  });
});

module.exports = sensorTypes;
