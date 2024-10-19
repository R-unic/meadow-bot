import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, type GuildMember, type CommandInteraction, bold } from "discord.js";

import { currencyFormat, random, replyWithEmbed } from "../../utility.js";
import { EconomyData } from "../../data/economy.js";
import Embed from "../../embed-presets.js";

enum RockPaperScisscors {
  Rock,
  Paper,
  Scissors
}

const enum GameResult {
  Win,
  Lose,
  Tie
}

@Discord()
@Category("Fun")
export class Rps {
  @Slash({ description: "Play rock paper scissors to win cash!" })
  public async rps(
    @SlashOption({
      description: "Your choice of rock, paper, or scissors",
      name: "choice",
      required: true,
      minValue: 0,
      maxValue: 2,
      type: ApplicationCommandOptionType.Integer,
      autocomplete(interaction) {
        interaction.respond([
          {
            name: "Rock",
            value: 0
          }, {
            name: "Paper",
            value: 1
          }, {
            name: "Scissors",
            value: 2
          }
        ]);
      }
    })
    choice: RockPaperScisscors,
    command: CommandInteraction
  ): Promise<void> {
    if (command.channel === null) return;

    const member = <GuildMember>command.member;
    const botChoice = random<RockPaperScisscors>(0, 2);
    let reward = random<number>(3, 50);
    let gameResult = GameResult.Lose;
    if (botChoice === choice)
      gameResult = GameResult.Tie;

    switch (choice) {
      case RockPaperScisscors.Rock:
        if (botChoice === RockPaperScisscors.Scissors)
          gameResult = GameResult.Win;
        break;
      case RockPaperScisscors.Paper:
        if (botChoice === RockPaperScisscors.Rock)
          gameResult = GameResult.Win;
        break;
      case RockPaperScisscors.Scissors:
        if (botChoice === RockPaperScisscors.Paper)
          gameResult = GameResult.Win;
        break;
    }

    switch (gameResult) {
      case GameResult.Win:
        await EconomyData.money.earn(member, reward);
        break;
    }

    const newMoney = await EconomyData.money.get(member);
    await replyWithEmbed(command,
      Embed.common("Rock Paper Scissors", "🪨📄✂️")
        .setDescription(
          `I chose ${bold(RockPaperScisscors[botChoice])}, ${gameResult === GameResult.Tie ? "we tied" : gameResult === GameResult.Lose ? "you lose" : "you won"}.`
          + (gameResult === GameResult.Win ? `\nYou won ${currencyFormat(reward)}. You now have ${currencyFormat(newMoney)}.` : "")
        )
    );
  }
}