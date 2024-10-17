import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type CommandInteraction, type GuildMember } from "discord.js";

import { EconomyData } from "../../data/economy.js";
import { random, replyWithEmbed, shuffle } from "../../utility.js";
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
      type: ApplicationCommandOptionType.Number,
    })
    amount: number,
    command: CommandInteraction
  ): Promise<void> {
    if (command.guild === null) return;

    const member = <GuildMember>command.member;
    const money = await EconomyData.money.get(member);
    if (amount <= 0)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.error("You can not bet nothing or less than nothing.")]
      });

    if (amount > money)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.insufficientMoney(`You do not have **${EconomyData.dollarSign}${amount}** to bet.`, money, amount)]
      });

    const rolledSlots = [];
    for (let i = 0; i < 3; i++) {
      const [slot] = shuffle(["🍒", "🍋", "🍉", "⭐", "🍇"]);
      rolledSlots.push(slot);
    }

    const [first, second, third] = rolledSlots;
    const display = rolledSlots.join("\\|") + "\n\n";
    if (first === second && second === third) {
      await EconomyData.money.increment(member, amount * 10); // EV = 0.5
      await replyWithEmbed(command, await Embed.win(`${display}Jackpot!`, member, amount));
    } else if (first === second || first === third || second === third) {
      await EconomyData.money.increment(member, amount); // EV = 0.5
      await replyWithEmbed(command, await Embed.win(`${display}You got a pair!`, member, amount));
    } else {
      await EconomyData.money.decrement(member, amount);
      await replyWithEmbed(command, await Embed.lose(`${display}No matches.`, member, amount));
    }
  }
}