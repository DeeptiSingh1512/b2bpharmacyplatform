declare module "papaparse" {
  export interface ParseResult<T> {
    data: T[];
    errors: Array<{
      type: string;
      code: string;
      message: string;
      row: number;
    }>;
    meta: {
      delimiter: string;
      linebreak: string;
      aborted: boolean;
      truncated: boolean;
      cursor: number;
      fields?: string[];
    };
  }

  export interface ParseConfig<T> {
    header?: boolean;
    skipEmptyLines?: boolean | string;
    complete?: (results: ParseResult<T>) => void;
    error?: (error: Error) => void;
  }

  // Changed this line only
  export type UnparseConfig = Record<string, unknown>;

  export function parse<T>(input: File | string, config?: ParseConfig<T>): void;
  export function unparse<T>(data: T[], config?: UnparseConfig): string;

  const Papa: {
    parse: typeof parse;
    unparse: typeof unparse;
  };

  export default Papa;
}
