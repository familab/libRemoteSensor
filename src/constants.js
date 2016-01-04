module.exports = {
  STATUS_CODE: {
    STARTED: 0x00,
    RUNNING: 0x01,
  },
  MESSAGE_TYPE: {
    // Status
    BEACON: 0x00,

    // Events
    ISO14443A_CARD_READ: 0xA0,

    // Commands
    ANIMATE: 0xD0,
    STOP_ANIMATE: 0xD1,

    RESET: 0xFF,
  },
  SENSOR_TYPES: {
    BaseSensor: 0x00,
    NFCSensor: 0x10,
  },
};
