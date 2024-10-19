export enum BoosterType {
  Experience1H_10,
  Experience3H_10,
  Experience8H_10,
  Experience24H_10,
  Money1H_10,
  Money3H_10,
  Money8H_10,
  Money24H_10
}

export interface ActiveBoosterData {
  readonly type: string;
  readonly amount: number;
  readonly startedAt: number;
  length: number;
}

export class ActiveBooster implements ActiveBoosterData {
  public constructor(
    public readonly type: string,
    public length: number,
    public readonly amount: number,
    public readonly startedAt = Math.floor(Date.now() / 1000)
  ) { }

  public static fromData(data: ActiveBoosterData): ActiveBooster {
    return new ActiveBooster(data.type, data.length, data.amount, data.startedAt);
  }

  public toData(): ActiveBoosterData {
    return {
      type: this.type,
      length: this.length,
      amount: this.amount,
      startedAt: this.startedAt
    };
  }

  public get isExpired(): boolean {
    return Math.floor(Date.now() / 1000) - this.startedAt >= this.length;
  }
}
