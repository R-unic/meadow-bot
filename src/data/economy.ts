import { DataField, DataName } from "./data-field.js";

/** @see GuildData */
export class EconomyData {
  public static readonly dollarSign = "$";
  public static readonly money = new DataField(DataName.Economy, "money", 0);
  public static readonly lastDailyClaim = new DataField(DataName.Economy, "lastDailyClaim", 0);
}