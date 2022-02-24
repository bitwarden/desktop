/* eslint-disable no-console */
import IPC from "./ipc";

// Mostly based on the example from MDN,
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging
export default class NativeMessage {
  ipc: IPC;

  constructor(ipc: IPC) {
    this.ipc = ipc;
  }

  send(message: object) {
    const messageBuffer = Buffer.from(JSON.stringify(message));

    const headerBuffer = Buffer.alloc(4);
    headerBuffer.writeUInt32LE(messageBuffer.length, 0);

    process.stdout.write(Buffer.concat([headerBuffer, messageBuffer]));
  }

  listen() {
    let payloadSize: number = null;

    // A queue to store the chunks as we read them from stdin.
    // This queue can be flushed when `payloadSize` data has been read
    const chunks: any = [];

    // Only read the size once for each payload
    const sizeHasBeenRead = () => Boolean(payloadSize);

    // All the data has been read, reset everything for the next message
    const flushChunksQueue = () => {
      payloadSize = null;
      chunks.splice(0);
    };

    const processData = () => {
      // Create one big buffer with all all the chunks
      const stringData = Buffer.concat(chunks);
      console.error(stringData);

      // The browser will emit the size as a header of the payload,
      // if it hasn't been read yet, do it.
      // The next time we'll need to read the payload size is when all of the data
      // of the current payload has been read (ie. data.length >= payloadSize + 4)
      if (!sizeHasBeenRead()) {
        try {
          payloadSize = stringData.readUInt32LE(0);
        } catch (e) {
          console.error(e);
          return;
        }
      }

      // If the data we have read so far is >= to the size advertised in the header,
      // it means we have all of the data sent.
      // We add 4 here because that's the size of the bytes that old the payloadSize
      if (stringData.length >= payloadSize + 4) {
        // Remove the header
        const contentWithoutSize = stringData.slice(4, payloadSize + 4).toString();

        // Reset the read size and the queued chunks
        flushChunksQueue();

        const json = JSON.parse(contentWithoutSize);

        // Forward to desktop application
        this.ipc.send(json);
      }
    };

    process.stdin.on("readable", () => {
      // A temporary variable holding the nodejs.Buffer of each
      // chunk of data read off stdin
      let chunk = null;

      // Read all of the available data
      // tslint:disable-next-line:no-conditional-assignment
      while ((chunk = process.stdin.read()) !== null) {
        chunks.push(chunk);
      }

      try {
        processData();
      } catch (e) {
        console.error(e);
      }
    });

    process.stdin.on("end", () => {
      process.exit(0);
    });
  }
}
