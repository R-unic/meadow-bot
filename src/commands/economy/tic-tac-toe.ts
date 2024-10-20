import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, bold, type CommandInteraction, type GuildMember } from "discord.js";

import { EconomyData } from "../../data/economy.js";
import { currencyFormat, random, replyWithEmbed, shuffle } from "../../utility.js";
import Embed from "../../embed-presets.js";

enum Player { X, O }
type Board = [
  [string, string, string],
  [string, string, string],
  [string, string, string]
];

const X_EMOJI = "🇽";
const O_EMOJI = "🇴";
const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
  [0, 4, 8], [2, 4, 6]              // Diagonals
];

@Discord()
@Category("Economy")
export class TicTacToe {
  @Slash({ description: "Bet on X or O winning a game of Tic-Tac-Toe." })
  public async "tic-tac-toe"(
    @SlashOption({
      description: "The winner you're betting on",
      name: "winner",
      required: true,
      minValue: 0,
      maxValue: 1,
      type: ApplicationCommandOptionType.Integer,
      autocomplete(interaction) {
        interaction.respond([
          {
            name: "X",
            value: 0
          }, {
            name: "O",
            value: 1
          }
        ]);
      }
    })
    winner: Player,
    @SlashOption({
      description: "The amount to bet",
      name: "amount",
      required: true,
      minValue: 0.01,
      type: ApplicationCommandOptionType.Number
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

    const chosenWinner = random<Player>(0, 1);
    const board = this.generateBoard(chosenWinner).map(row => row.join(" ")).join("\n") + "\n\n";
    if (winner === chosenWinner) {
      await EconomyData.money.earn(member, amount); // EV = 0.5
      await replyWithEmbed(command, await Embed.win(`${board}${bold(Player[chosenWinner])} won the game, which is who you predicted!`, member, amount));
    } else {
      await EconomyData.money.decrement(member, amount);
      await replyWithEmbed(command, await Embed.lose(`${board}${bold(Player[chosenWinner])} won the game.`, member, amount));
    }
  }

  private generateBoard(winner: Player): Board {
    const board = Array<string>(9).fill("🟦");
    const winnerEmoji = winner === 0 ? X_EMOJI : O_EMOJI;
    const loserEmoji = winner === 0 ? O_EMOJI : X_EMOJI;
    const winningLine = WINNING_LINES[random(0, WINNING_LINES.length - 1)];
    for (let i = 0; i < 2; i++)
      board[winningLine[i]] = winnerEmoji;

    let remainingPositions: number[] = [];
    for (let i = 0; i < board.length; i++)
      if (board[i] === "🟦")
        remainingPositions.push(i);

    const winnerMovesCount = 2;
    const loserMovesCount = 3;
    const totalMoves = winnerMovesCount + loserMovesCount;
    remainingPositions = shuffle(remainingPositions);

    for (let i = 0; i < totalMoves; i++) {
      const pos = remainingPositions[i];
      board[pos] = i < winnerMovesCount ?
        ((i % 2 === 0) ? winnerEmoji : loserEmoji)
        : loserEmoji;
    }

    const [_, __, finalWinPosition] = winningLine;
    board[finalWinPosition] = winnerEmoji;

    const [first, second, third, fourth, fifth, sixth, seventh, eighth, ninth] = board;
    return [
      [first, second, third],
      [fourth, fifth, sixth],
      [seventh, eighth, ninth]
    ];
  }
}