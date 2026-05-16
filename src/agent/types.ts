export interface Message {
  role: "user" | "assistant" | "tool";
  content: string;
  toolName?: string;
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
  setCode(code: string, evaluate?: boolean): void;
}

