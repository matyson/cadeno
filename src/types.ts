import { ACCESS_RIGHTS, DBR_TYPES } from "./constants.ts";

export type AccessRights = typeof ACCESS_RIGHTS[keyof typeof ACCESS_RIGHTS];
export type DBRType = typeof DBR_TYPES[keyof typeof DBR_TYPES];

export type Header = { // 16 bytes
  command: number; // UINT16 - 2 bytes
  payloadSize: number; // UINT16 or UINT32 - 2 or 4 bytes
  dataType: number; // UINT16 - 2 bytes
  dataCount: number; // UINT16 or UINT32 - 2 or 4 bytes
  param1: number; // UINT32 - 4 bytes
  param2: number; // UINT32 - 4 bytes
};

export type ExtendedHeader = {
  command: number; // UINT16 - 2 bytes
  marker1: number; // always 0xffff - 2 bytes
  dataType: number; // UINT16 - 2 bytes
  marker2: number; // always 0x0000 - 2 bytes
  param1: number; // UINT32 - 4 bytes
  param2: number; // UINT32 - 4 bytes
  payloadSize: number; // UINT32 - 4 bytes
  dataCount: number; // UINT32 - 4 bytes
};

export type Channel = {
  name: string;
  cid: number;
  sid: number;
  dataType: number;
  accessRights: AccessRights;
};

export interface Message {
  header: Header | ExtendedHeader;
  payload: Uint8Array | undefined;
}

export interface Request extends Message {
  raw: Uint8Array;
}

export interface Response extends Message {}
