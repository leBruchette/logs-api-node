import * as z from 'zod';
import { ZodError, ZodIssue, ZodIssueCode } from 'zod';

function customZodError(expected: any, received: any, parameter: string) {
  const zodIssues: ZodIssue[] = [{
    code: ZodIssueCode.invalid_type,
    expected: expected,
    received: typeof received,
    path: [],
    message: `Expected ${expected}, but received ${received} (${typeof received}) for parameter \'${parameter}\'.`,
  }];
  return new ZodError(zodIssues);
}

export const LogsRequest = z.object({
  lines: z.string().default('30').transform((val) => {
    if (val.trim().length == 0) {
      return 30;
    }
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      throw customZodError('number', val, 'lines');
    }
    return parsed;
  }),
  path: z.string().transform((val) => `/${val}`),
  search: z.string().default(''),
});
export type LogsRequest = z.infer<typeof LogsRequest>;

export class FileOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileReadError';
  }
}

export class FileStatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileStatError';
  }
}