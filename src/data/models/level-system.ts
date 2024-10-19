import { BoosterType } from "./boosters";

export interface LevelSystemMemberData {
  readonly xp: number;
  readonly level: number;
  readonly prestige: number;
  readonly ownedBoosters: Record<BoosterType, number>;
}