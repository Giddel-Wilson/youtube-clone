export interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

export type SpeechRecognitionImpl = {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      prototype: SpeechRecognitionImpl;
      new(): SpeechRecognitionImpl;
    };
    webkitSpeechRecognition: {
      prototype: SpeechRecognitionImpl;
      new(): SpeechRecognitionImpl;
    };
  }
}
