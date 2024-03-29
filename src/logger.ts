type LogMethod = keyof Omit<typeof Log, "prototype">;

const RESET_COLOR = "\u001b[0m";
const COLOR_SCHEME: Record<LogMethod, string> = {
  info: "\u001b[32m",
  warning: "\u001b[31m",
  error: "\u001b[31m"
};

export default class Log {
  public static info(...messages: unknown[]): void {
    this.log("info", ...messages);
  }

  public static warning(...messages: unknown[]): void {
    this.log("warning", ...messages);
  }

  public static error(...messages: unknown[]): void {
    this.log("error", ...messages);
  }

  private static log(method: LogMethod, ...messages: unknown[]): void {
    const color = COLOR_SCHEME[method];
    const time = (new Date).toLocaleTimeString().split(" ")[0]
    console.log(`[\u001b[49m${time}${RESET_COLOR}] [${color}${method.toUpperCase()}${RESET_COLOR}]: ${messages.join(" ")}`);
  }
}