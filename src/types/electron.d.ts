declare global {
  interface Window {
    electron: {
      ping: () => Promise<string>;
      invokeLLM: (payload: any) => Promise<any>;
      onTamboEvent: (cb: (...args: any[]) => void) => void;
    };
  }
}

export {};
