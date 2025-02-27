import { ADDR_LIST, REPEATER_PORT } from "./constants.ts";
import { commands } from "./constants.ts";
import { headerFromBuffer, headerToBuffer } from "./headers.ts";
import { RESPONSE_SIZE } from "./constants.ts";

export async function registerRepeater() {
  const clientHost = "127.0.0.1";
  const clientPort = 8080;
  const udpSocket = Deno.listenDatagram({
    transport: "udp",
    hostname: clientHost,
    port: clientPort,
  });

  const ipToNumber = (ip: string) =>
    ip
      .split(".")
      .reduce((acc, octet, i) => acc + parseInt(octet) * 256 ** i, 0);

  const numberToIp = (num: number) =>
    Array.from({ length: 4 }, (_, i) => (num >> (i * 8)) & 0xff)
      .reverse()
      .join(".");

  const registerCommand = headerToBuffer({
    command: commands.REPEATER_REGISTER,
    payloadSize: 0,
    dataType: 0,
    dataCount: 0,
    param1: 0,
    param2: ipToNumber(clientHost),
  });

  const repeaterAddr: Deno.Addr = {
    transport: "udp",
    hostname: ADDR_LIST[0],
    port: REPEATER_PORT,
  };

  await udpSocket.send(registerCommand, repeaterAddr);

  const response = new Uint8Array(RESPONSE_SIZE);
  const [data, _addr] = await udpSocket.receive(response);

  const header = headerFromBuffer(data);
  console.log(header);
  console.log(numberToIp(header.param2));
  udpSocket.close();
}
