import type { Header, Response } from "./types.ts";
import { commands, DBR_TYPES, errors, HEADER_SIZE } from "./constants.ts";
import { headerFromBuffer } from "./headers.ts";

function payloadFromBuffer(
  buf: Uint8Array,
  payloadSize: number,
): Uint8Array | undefined {
  if (payloadSize === 0) {
    return undefined;
  }
  return buf.slice(HEADER_SIZE, HEADER_SIZE + payloadSize);
}

function response(header: Header, payload?: Uint8Array): Response {
  return { header, payload };
}

function decode(buf: Uint8Array): Response {
  const header = headerFromBuffer(buf);
  return response(header, payloadFromBuffer(buf, header.payloadSize));
}

function decodeAccessRightsResponse(buf: Uint8Array): Response {
  const res = decode(buf);
  if (res.header.command !== commands.ACCESS_RIGHTS) {
    throw new Error("Expected access rights response");
  }
  return res;
}

function decodeCreateChannelResponse(buf: Uint8Array): Response {
  const res = decode(buf);
  if (res.header.command === errors.CREATE_CHAN) {
    throw new Error("Channel creation failed");
  }
  return res;
}

function decodeSearchResponse(buf: Uint8Array): Response {
  const res = decode(buf);
  if (res.header.command === errors.NOT_FOUND) {
    throw new Error("Channel not found");
  }
  return res; // payload is server version UINT16
}

function decodeReadNotifyResponse(buf: Uint8Array): Response {
  const res = decode(buf);
  if (!res.payload) {
    throw new Error("Expected data");
  }
  return res;
}

type Data = number | string | boolean;

function parseData(buf: Uint8Array, type: number, count: number): Data[] {
  const view = new DataView(buf.buffer);

  switch (type) {
    case DBR_TYPES.INT: {
      const intData: number[] = [];
      for (let i = 0; i < count; i++) {
        intData.push(view.getInt32(i * 4));
      }
      return intData;
    }
    case DBR_TYPES.STRING: {
      const strData: string[] = [];
      for (let i = 0; i < count; i++) {
        const strLen = view.getInt32(i * 4);
        const str = new TextDecoder().decode(
          buf.slice(4 + i * 4, 4 + i * 4 + strLen),
        );
        strData.push(str);
      }
      return strData;
    }
    case DBR_TYPES.ENUM: {
      const enumData: string[] = [];
      for (let i = 0; i < count; i++) {
        const enumVal = view.getInt16(i * 2);
        enumData.push(enumVal.toString());
      }
      return enumData;
    }
    case DBR_TYPES.CHAR: {
      const charData: string[] = [];
      for (let i = 0; i < count; i++) {
        const char = view.getInt8(i);
        charData.push(String.fromCharCode(char));
      }
      return charData;
    }
    case DBR_TYPES.LONG: {
      const longData: number[] = [];
      for (let i = 0; i < count; i++) {
        longData.push(view.getInt32(i * 4));
      }
      return longData;
    }
    case DBR_TYPES.DOUBLE: {
      const doubleData: number[] = [];
      for (let i = 0; i < count; i++) {
        doubleData.push(view.getFloat64(i * 8));
      }
      return doubleData;
    }
    case DBR_TYPES.FLOAT: {
      const floatData: number[] = [];
      for (let i = 0; i < count; i++) {
        floatData.push(view.getFloat32(i * 4));
      }
      return floatData;
    }
    default:
      throw new Error("Unsupported data type");
  }
}

export {
  decodeAccessRightsResponse,
  decodeCreateChannelResponse,
  decodeReadNotifyResponse,
  decodeSearchResponse,
  parseData,
};
