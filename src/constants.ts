export const PAYLOAD_MAX_SIZE = 16368; // 16KB or 16368 bytes
export const HEADER_SIZE = 16; // 16 bytes
export const EXTENDED_HEADER_SIZE = 24; // 24 bytes
export const MAX_MESSAGE_SIZE = PAYLOAD_MAX_SIZE + HEADER_SIZE;
export const RESPONSE_SIZE = 1024;
export const MAX_PRIORITY = 99;
export const DEFAULT_PRIORITY = 0;
export const MAJOR_PROTOCOL_VERSION = 4; // CA major version
export const MINOR_PROTOCOL_VERSION = 13; // 2010 minor version
export const BASE_PORT = 5056;
export const REPEATER_PORT = BASE_PORT + MAJOR_PROTOCOL_VERSION * 2 + 1; // 5065
export const SERVER_PORT = BASE_PORT + MAJOR_PROTOCOL_VERSION * 2; // 5064
export const ADDR_LIST = ["127.0.0.1"];

export const ACCESS_RIGHTS = {
  READ: 1,
  WRITE: 2,
  READ_WRITE: 3,
  NO_ACCESS: 0,
} as const;

export const IOID = {
  GET: 0,
  PUT: 1,
} as const;

export const SEARCH_REPLY_FLAGS = {
  DO_REPLY: 10, // server should reply failed search requests
  DONT_REPLY: 5, // server shouuld ignore failed search requests
} as const;

export const commands = {
  VERSION: 0,
  EVENT_ADD: 1,
  EVENT_CANCEL: 2,
  WRITE: 4,
  SEARCH: 6,
  EVENTS_OFF: 8,
  EVENTS_ON: 9,
  ERROR: 11,
  CLEAR_CHANNEL: 12,
  NOT_FOUND: 14,
  READ_NOTIFY: 15,
  CREATE_CHAN: 18,
  WRITE_NOTIFY: 19,
  CLIENT_NAME: 20,
  HOST_NAME: 21,
  ACCESS_RIGHTS: 22,
  ECHO: 23,
  REPEATER_REGISTER: 24,
  CREATE_CH_FAIL: 26,
  SERVER_DISCONN: 27,
} as const;

export const errors = {
  NOT_FOUND: 14,
  CREATE_CHAN: 26,
} as const;

export const SEVERITY_CODES = {
  WARNING: 0,
  SUCCESS: 1,
  ERROR: 2,
  INFO: 3,
  SEVERE: 4,
} as const;

export const DBR_TYPES = {
  STRING: 0,
  INT: 1,
  SHORT: 1,
  FLOAT: 2,
  ENUM: 3,
  CHAR: 4,
  LONG: 5,
  DOUBLE: 6,
  STS_STRING: 7,
  STS_INT: 8,
  STS_SHORT: 8,
  STS_FLOAT: 9,
  STS_ENUM: 10,
  STS_CHAR: 11,
  STS_LONG: 12,
  STS_DOUBLE: 13,
  TIME_STRING: 14,
  TIME_INT: 15,
  TIME_SHORT: 15,
  TIME_FLOAT: 16,
  TIME_ENUM: 17,
  TIME_CHAR: 18,
  TIME_LONG: 19,
  TIME_DOUBLE: 20,
  GR_STRING: 21,
  GR_INT: 22,
  GR_SHORT: 22,
  GR_FLOAT: 23,
  GR_ENUM: 24,
  GR_CHAR: 25,
  GR_LONG: 26,
  GR_DOUBLE: 27,
  CTRL_STRING: 28,
  CTRL_INT: 29,
  CTRL_SHORT: 29,
  CTRL_FLOAT: 30,
  CTRL_ENUM: 31,
  CTRL_CHAR: 32,
  CTRL_LONG: 33,
  CTRL_DOUBLE: 34,
  PUT_ACKT: 35,
  PUT_ACKS: 36,
  STSACK_STRING: 37,
  CLASS_NAME: 38,
} as const;
