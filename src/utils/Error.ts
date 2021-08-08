class CustomError extends Error {
  constructor(message: string, ...params: string[]) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }

    this.name = 'CustomError';
    this.message = message;
  }
}

export class E extends CustomError {
  constructor(message: string, ...params: string[]) {
    super(message, ...params);

    this.name = 'e';
  }
}

