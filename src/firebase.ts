import Log from "./logger.js";

// Complain if we don't have values to input
if (!process.env.FIREBASE_AUTH)
  throw new Error("No value for FIREBASE_AUTH in .env file")
if (!process.env.FIREBASE_URL)
  throw new Error("No value for FIREBASE_URL in .env file")

export class Firebase {
  private readonly auth = `.json?auth=${process.env.FIREBASE_AUTH}`;

  public constructor(
    private readonly baseURL: string
  ) {
    this.baseURL = this.fixPath(baseURL) + "/";
  }

  public async set(path?: string, value?: unknown, headers?: Record<string, string>): Promise<void> {
    if ((value instanceof Array && value.length === 0) || (value instanceof Object && Object.entries(value).length === 0))
      return this.delete(path);

    await fetch(this.getEndpoint(path), {
      method: "PUT",
      body: JSON.stringify(value),
      headers
    }).catch(err => Log.error(`[Firebase]: ${err}`));
  }

  public async get<T>(path?: string, defaultValue?: T): Promise<T> {
    try {
      return <T>await fetch(this.getEndpoint(path), { method: "GET" })
        .then(res => res.json()) ?? defaultValue!;
    } catch (error) {
      throw Log.error(`[Firebase]: ${error}`);
    }
  }

  public async delete(path?: string): Promise<void> {
    await this.set(path, undefined, { "X-HTTP-Method-Override": "DELETE" });
  }

  public async reset(): Promise<void> {
    await this.delete("");
  }

  public async increment(path?: string, delta = 1): Promise<void> {
    await this.set(path, await this.get<number>(path) + delta);
  }

  public async addToArray<T>(path: string, value: T, maxArraySize?: number): Promise<void> {
    const data = await this.get<T[]>(path, []);
    if (maxArraySize !== undefined)
      if (data.length >= maxArraySize) {
        const diff = data.length - maxArraySize;
        for (let i = 0; i < diff + 1; i++)
          data.shift();
      }

    data.push(value);
    this.set(path, data);
  }

  private getEndpoint(path?: string): string {
    path = this.fixPath(path);
    return this.baseURL + encodeURIComponent(path === undefined ? "" : `/${path}`) + this.auth;
  }

  private fixPath(path?: string): string {
    if (path === undefined) return "";
    path = this.removeExtraSlash(path);
    return path;
  }

  private removeExtraSlash(path: string): string {
    if (path.endsWith("/"))
      path = path.slice(0, -1);

    return path.endsWith("/") ? this.removeExtraSlash(path) : path;
  }
}
