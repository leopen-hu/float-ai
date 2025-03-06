/// <reference types="chrome" />

declare namespace chrome {
  export namespace runtime {
    export function sendMessage<T>(message: unknown): Promise<T>;
  }

  export namespace storage {
    export namespace local {
      export function set(items: Record<string, unknown>): Promise<void>;
      export function get(keys: string | string[] | Record<string, unknown> | null): Promise<Record<string, unknown>>;
    }
  }
}
