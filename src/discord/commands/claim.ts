import {
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
} from 'discord.js';

import { CONFIG, COPY, EMOJIS } from '@/constants';
import { LogCode } from '@/enums/logs';
import { getActivity, updateActivity } from '@/services/activity';
import { incDiscordUser } from '@/services/user';

import { checkFeatureEnabled, log, reply } from '../helpers';

const CLAIM_AMOUNTS = {
  BASE: 250,
  DISCORD_SUB: 299,
  NITRO_BOOSTER: 499,
  TWITCH_TIER1: 599,
  TWITCH_TIER2: 999,
  TWITCH_TIER3: 2499,
};

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

const getTwitchTierBonus = (member: GuildMember): number => {
  const roles = CONFIG.ROLES.SUBSCRIBER;
  if (member.roles.cache.has(roles.TWITCH_TIER3))
    return CLAIM_AMOUNTS.TWITCH_TIER3;
  if (member.roles.cache.has(roles.TWITCH_TIER2))
    return CLAIM_AMOUNTS.TWITCH_TIER2;
  if (member.roles.cache.has(roles.TWITCH_TIER1))
    return CLAIM_AMOUNTS.TWITCH_TIER1;
  return 0;
};

export const Claim = {
  data: new SlashCommandBuilder()
    .setName(COPY.CLAIM.NAME)
    .setDescription(COPY.CLAIM.DESCRIPTION),
  execute: async (
    interaction: ChatInputCommandInteraction,
    member: GuildMember,
  ) => {
    if (!(await checkFeatureEnabled('CLAIM', interaction))) return;

    const claimActivity = await getActivity(interaction.user.id, 'claim');
    const now = new Date();
    const lastUsed = claimActivity?.last_used;

    if (lastUsed && now.getTime() - lastUsed.getTime() < COOLDOWN_MS) {
      const nextClaim = new Date(lastUsed.getTime() + COOLDOWN_MS);
      reply({
        content: `You already claimed today. Next claim available <t:${Math.floor(nextClaim.getTime() / 1000)}:R>.`,
        ephemeral: true,
        interaction,
      });
      return;
    }

    const twitchBonus = getTwitchTierBonus(member);
    const discordSubBonus = member.roles.cache.has(
      CONFIG.ROLES.SUBSCRIBER.DISCORD,
    )
      ? CLAIM_AMOUNTS.DISCORD_SUB
      : 0;
    const nitroBonus = member.premiumSince ? CLAIM_AMOUNTS.NITRO_BOOSTER : 0;
    const total =
      CLAIM_AMOUNTS.BASE + twitchBonus + discordSubBonus + nitroBonus;

    const updated = await updateActivity(interaction.user.id, {
      $set: { 'claim.last_used': now },
    });

    if (!updated) {
      reply({
        content: 'Something went wrong. Please try again later.',
        ephemeral: true,
        interaction,
      });
      return;
    }

    await incDiscordUser(interaction.user.id, 'cash', total);

    const lines: string[] = [
      `Base Reward: \`${CLAIM_AMOUNTS.BASE}\` ${EMOJIS.CURRENCY}`,
    ];
    if (twitchBonus)
      lines.push(
        `Twitch Subscriber Bonus: \`${twitchBonus}\` ${EMOJIS.CURRENCY}`,
      );
    if (discordSubBonus)
      lines.push(
        `Discord Subscriber Bonus: \`${discordSubBonus}\` ${EMOJIS.CURRENCY}`,
      );
    if (nitroBonus)
      lines.push(`Nitro Booster Bonus: \`${nitroBonus}\` ${EMOJIS.CURRENCY}`);
    lines.push(`\n**TOTAL:** \`${total}\` ${EMOJIS.CURRENCY}`);

    const embed = new EmbedBuilder()
      .setColor(CONFIG.COLORS.BLUE as ColorResolvable)
      .setTitle(`${interaction.user.displayName} claimed their daily reward!`)
      .setDescription(lines.join('\n'));

    try {
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      log({ type: LogCode.Error, description: JSON.stringify(error) });
    }
  },
  getName: (): string => COPY.CLAIM.NAME,
};
