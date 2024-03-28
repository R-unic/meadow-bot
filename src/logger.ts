type LogMethod = keyof Omit<typeof Log, "prototype">;

const RESET_COLOR = "\u001b[0m";
const COLOR_SCHEME: Record<LogMethod, string> = {
  info: "\u001b[32m",
  warning: "\u001b[31m",
  error: "\u001b[31m"
};

export default class Log {
  public static info(message: string): void {
    this.log("info", message);
  }

  public static warning(message: string): void {
    this.log("warning", message);
  }

  public static error(message: string): void {
    this.log("error", message);
  }

  private static log(method: LogMethod, message: string): void {
    const color = COLOR_SCHEME[method];
    console.log(`[${color}${method.toUpperCase()}${RESET_COLOR}]: ${message}`);
  }
}