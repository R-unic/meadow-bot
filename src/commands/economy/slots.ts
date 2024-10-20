import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type CommandInteraction, type GuildMember } from "discord.js";

import { EconomyData } from "../../data/economy.js";
import { currencyFormat, replyWithEmbed, shuffle } from "../../utility.js";
import Embed from "../../embed-presets.js";

@Discord()
@Category("Economy")
export class Slots {
  @Slash({ description: "Bet on slots rolling matches." })
  public async slots(
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

    const rolledSlots = [];
    for (let i = 0; i < 3; i++) {
      const [slot] = shuffle(["🍒", "🍋", "🍉", "⭐", "🍇"]);
      rolledSlots.push(slot);
    }

    const [first, second, third] = rolledSlots;
    const display = rolledSlots.join(" **\\|** ") + "\n\n";
    if (first === second && second === third) {
      amount = await EconomyData.money.earn(member, amount * 10); // EV = 0.5
      await replyWithEmbed(command, await Embed.win(`${display}Jackpot!`, member, amount));
    } else if (first === second || first === third || second === third) {
      amount = await EconomyData.money.earn(member, amount); // EV = 0.5
      await replyWithEmbed(command, await Embed.win(`${display}You got a pair!`, member, amount));
    } else {
      await EconomyData.money.decrement(member, amount);
      await replyWithEmbed(command, await Embed.lose(`${display}No matches.`, member, amount));
    }
  }
}