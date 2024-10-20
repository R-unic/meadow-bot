import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type CommandInteraction, type GuildMember } from "discord.js";

import { EconomyData } from "../../data/economy.js";
import { currencyFormat, random, replyWithEmbed } from "../../utility.js";
import Embed from "../../embed-presets.js";

enum CoinSide {
  Tails,
  Heads
}

@Discord()
@Category("Economy")
export class Coinflip {
  @Slash({ description: "Bet on a coin flip landing on your chosen side." })
  public async coinflip(
    @SlashOption({
      description: "Heads or tails (0 tails - 1 heads)",
      name: "side",
      required: true,
      minValue: 0,
      maxValue: 1,
      type: ApplicationCommandOptionType.Integer,
      autocomplete(interaction) {
        interaction.respond([
          {
            name: "Heads",
            value: 1
          }, {
            name: "Tails",
            value: 0
          }
        ]);
      }
    })
    side: CoinSide,
    @SlashOption({
      description: "The amount to bet",
      name: "amount",
      required: true,
      minValue: 0.01,
      type: ApplicationCommandOptionType.Number,
    })
    amount: number,
    command: CommandInteraction
  ): Promise<void> {
    if (command.guild === null) return;

    const member = <GuildMember>command.member;
    const money = await EconomyData.money.get(member);
    if (amount > money)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.insufficientMoney(`You do not have ${currencyFormat(amount)} to bet.`, money, amount)]
      });

    const flip = random<CoinSide>(0, 1, parseInt(command.user.id));
    if (flip === side) {
      amount = await EconomyData.money.earn(member, amount); // EV = 0.5
      await replyWithEmbed(command, await Embed.win(`The coin landed on **${CoinSide[flip].toLowerCase()}** which is the same side you chose.`, member, amount));
    } else {
      await EconomyData.money.decrement(member, amount);
      await replyWithEmbed(command, await Embed.lose(`The coin landed on **${CoinSide[flip].toLowerCase()}**.`, member, amount));
    }
  }
}