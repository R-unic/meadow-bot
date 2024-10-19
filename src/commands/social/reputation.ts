import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, userMention, type User, type CommandInteraction, type GuildMember } from "discord.js";

import { replyWithEmbed, reputationPointsFormat, time, toRemainingTime } from "../../utility.js";
import Embed from "../../embed-presets.js";
import { ReputationSystemData } from "../../data/reputation-system.js";

@Discord()
@Category("Social")
@SlashGroup({
  name: "reputation",
  description: "Give, remove, or check reputation points."
})
export class Reputation {
  private readonly cooldownTime = 15 * time.minutes;

  @Slash({ description: "View the RP of a user." })
  @SlashGroup("reputation")
  public async view(
    @SlashOption({
      description: "The user to check the RP of (omit for self)",
      name: "user",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    user: Maybe<User>,
    command: CommandInteraction
  ): Promise<void> {
    if (command.guild === null) return;

    const member = await command.guild.members.fetch(user ?? command.user);
    if (member.user.bot)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.error("You cannot view the RP of bots.")]
      });

    const isExecutor = member === command.member;
    const rp = await ReputationSystemData.reputation.get(member);

    await replyWithEmbed(command,
      Embed.common()
        .setAuthor({
          name: `${isExecutor ? "Your" : member.user.globalName + "'s"} RP`,
          iconURL: member.displayAvatarURL()
        })
        .setDescription(`${isExecutor ? "You have" : userMention(member.id) + " has"} ${reputationPointsFormat(rp)}`)
    );
  }

  @Slash({ description: "Add a reputation point to a user." })
  @SlashGroup("reputation")
  public async add(
    @SlashOption({
      description: "The user to give a point to",
      name: "user",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User,
    command: CommandInteraction
  ): Promise<void> {
    if (command.guild === null) return;

    const member = <GuildMember>command.member;
    const receiver = await command.guild.members.fetch(user);
    if (receiver === member)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.error("You cannot add a reputation point to yourself!")]
      });
    if (receiver.user.bot)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.error("You cannot modify the RP of bots.")]
      });

    const cooldownActive = await this.isCooldownActive(member);
    if (cooldownActive)
      return await this.cooldownActiveError(command, member);

    await ReputationSystemData.reputation.increment(receiver);
    await ReputationSystemData.lastPointGiven.set(member, Math.floor(Date.now() / 1000));

    const newRP = await ReputationSystemData.reputation.get(receiver);
    await replyWithEmbed(command, Embed.success(`Successfully added a reputation point to ${userMention(receiver.id)}!\nThey are now at ${reputationPointsFormat(newRP)}.`));
  }

  @Slash({ description: "Remove a reputation point from a user." })
  @SlashGroup("reputation")
  public async remove(
    @SlashOption({
      description: "The user to remove a point from",
      name: "user",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: User,
    command: CommandInteraction
  ): Promise<void> {
    if (command.guild === null) return;
    const member = <GuildMember>command.member;
    const receiver = await command.guild.members.fetch(user);
    if (receiver === member)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.error("You cannot remove a reputation point from yourself!")]
      });
    if (receiver.user.bot)
      return void await command.reply({
        ephemeral: true,
        embeds: [Embed.error("You cannot modify the RP of bots.")]
      });

    const cooldownActive = await this.isCooldownActive(member);
    if (cooldownActive)
      return await this.cooldownActiveError(command, member);

    await ReputationSystemData.reputation.decrement(receiver);
    await ReputationSystemData.lastPointGiven.set(member, Math.floor(Date.now() / 1000));

    const newRP = await ReputationSystemData.reputation.get(receiver);
    await replyWithEmbed(command, Embed.success(`Successfully removed a reputation point from ${userMention(receiver.id)}!\nThey are now at ${reputationPointsFormat(newRP)}.`));
  }

  private async cooldownActiveError(command: CommandInteraction, member: GuildMember): Promise<void> {
    const now = Date.now() / 1000;
    const lastPointGiven = await ReputationSystemData.lastPointGiven.get(member);
    const elapsedTime = now - lastPointGiven;
    await command.reply({
      ephemeral: true,
      embeds: [Embed.error(`Cooldown active. You need to wait **${toRemainingTime(this.cooldownTime - elapsedTime)}**.`)]
    });
  }

  private async isCooldownActive(member: GuildMember): Promise<boolean> {
    const now = Date.now() / 1000;
    const lastPointGiven = await ReputationSystemData.lastPointGiven.get(member);
    return now - lastPointGiven < this.cooldownTime;
  }
}