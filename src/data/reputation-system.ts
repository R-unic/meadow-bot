import { MemberNumberField, DataName } from "./data-field.js";

/** @see GuildData */
export class ReputationSystemData {
  public static readonly reputation = new MemberNumberField(DataName.ReputationSystem, "reputation", 0);
  public static readonly lastPointGiven = new MemberNumberField(DataName.ReputationSystem, "lastPointGiven", 0);
}