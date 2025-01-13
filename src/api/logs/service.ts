import { open } from 'fs/promises';
import { FileOpenError, FileStatError, LogsRequest } from './types';
import { FileHandle } from 'node:fs/promises';

const BUFFER_SIZE = parseInt(process.env.READ_BUFFER_SIZE || '1024', 10);
const BUFFER = Buffer.alloc(BUFFER_SIZE);

// Define a type so we can pass Response.write() as a parameter 
type ResponseWriter = (chunk: any, callback?: (error: Error | null | undefined) => void) => boolean;

export default class LogStreamingService {
  protected responseWriter: ResponseWriter;

  constructor(responseWriter: ResponseWriter = () => true) {
    this.responseWriter = responseWriter;
  }

  public setResponseWriter(responseWriter: ResponseWriter) {
    this.responseWriter = responseWriter;
    return this;
  }

  // Check if the line is printable and contains the search text (case-insensitive) if provided
  private isPrintableLine(line: string, searchText: string) {
    return line.trim().length > 0 && (!searchText || line.toLowerCase().includes(searchText.toLowerCase()));
  }

  // Remove empty bytes from the buffer to avoid printing them e.g. null characters
  private removeEmptyBytes(buffer: Buffer): Buffer {
    return Buffer.from(buffer.filter(byte => byte !== 0));
  }

  /* Recursively read the file in chunks of BUFFER_SIZE bytes, starting from the end of the file to obtain most recent.
     Using a Buffer is necessary to read the file in chunks and avoid reading the entire file into memory. */
  private async writeChunkToResponse(fileHandle: FileHandle, position: number, leftover: string, lineCount: number, request: LogsRequest, firstLine: boolean) {
    // Exit condition; "close" the JSON array and file handle
    if (position <= 0 || lineCount >= request.lines) {
      this.responseWriter('\n]\n}');
      await fileHandle.close();
      return;
    }

    /* Execution condition;
       read the file in chunks of BUFFER_SIZE bytes into our response writer
       and recursively call this function to read the next chunk */
    const readSize = Math.min(BUFFER_SIZE, position);
    position -= readSize;

    await fileHandle.read(BUFFER, 0, readSize, position);
    const chunk = this.removeEmptyBytes(BUFFER).subarray(0, readSize).toString('utf8');
    const lines = (chunk + leftover).split('\n');
    /* because our chunking reading backwards from EOF could have split the first line read, leaving a partial line
       set leftover and append it to the next chunk read prior to splitting.
       This should only be a concern if the file being streamed was smaller than the allocated buffer, no
       need to pop the first element if we can read the entire file in one pass...*/
    if (position > 0)
      leftover = lines.shift() || '';

    for (let i = lines.length - 1; i >= 0; i--) {
      if (lineCount < request.lines && this.isPrintableLine(lines[i], request.search)) {
        // handling proper json formatting - prepend each line with a comma and newline if not the first line we're writing
        if (!firstLine) {
          this.responseWriter(',\n');
        }
        firstLine = false;
        this.responseWriter(`${JSON.stringify(lines[i])}`);
        lineCount++;
      }
    }

    await this.writeChunkToResponse(fileHandle, position, leftover, lineCount, request, firstLine);
  }

  // wrap open() so we can throw/handle custom error
  private async openFile(request: LogsRequest) {
    return open(request.path, 'r')
      .catch((error) => {
        let message = (error instanceof Error) ? error.message : 'An error occurred while opening the file';
        throw new FileOpenError(message);
      });
  }

  // transitively wrap stat() so we can throw/handle custom error
  private async statFile(fileHandle: FileHandle, request: LogsRequest) {
    return this.getFileDetails(fileHandle, request)
      .catch((error) => {
        let message = (error instanceof Error) ? error.message : 'An error occurred while reading the file details';
        throw new FileStatError(message);
      });
  }

  private async getFileDetails(fileHandle: FileHandle, request: LogsRequest) {
    return fileHandle.stat().then(fileStats => ({
      name: request.path,
      size: fileStats.size,
      createdAt: fileStats.birthtime,
      modifiedAt: fileStats.mtime,
    }));
  }

  public async readLines(request: LogsRequest) {
    const fileHandle = await this.openFile(request);
    const fileDetails = await this.statFile(fileHandle, request);

    this.responseWriter(`{\n\"file\": ${JSON.stringify(fileDetails)},\n\"lines\": [\n`);

    await this.writeChunkToResponse(fileHandle, fileDetails.size, '', 0, request, true);
  }
}
