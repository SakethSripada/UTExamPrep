export type JavaRunRequest = {
  questionId?: string;
  code?: string;
};

export type Harness = {
  files: Record<string, string>;
};

export type JavaTools =
  | {
      available: true;
      javac: string;
      java: string;
      javacVersion: string;
      javaVersion: string;
    }
  | {
      available: false;
      message: string;
      stderr?: string;
    };
