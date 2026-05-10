export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface StrudelEditorElement extends HTMLElement {
  editor?: {
    code: string;
    setCode(code: string): void;
    evaluate(): Promise<void>;
  };
}

export interface StrudelEditorHandle {
  getCode(): string;
  setCode(code: string): void;
}

declare global {
  function initStrudel(opts: {
    prebake: () => Promise<unknown[]>;
  }): void;

  function samples(
    json: string,
    base: string,
    opts?: { prebake?: boolean; tag?: string }
  ): Promise<unknown>;
}
