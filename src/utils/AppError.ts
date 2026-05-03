export class AppError extends Error {
  code: string;
  userMessage: string;
  detail?: string;

  constructor(code: string, userMessage: string, detail?: string) {
    super(userMessage);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
    this.detail = detail;
  }
}
