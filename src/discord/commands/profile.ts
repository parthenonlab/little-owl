import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

import { CONFIG, COPY, MONTH_MAP } from '@/constants';
import { LogCode } from '@/enums/logs';
import { SilverIcon, StarIcon } from '@/icons';

import { UserDocument } from '@/interfaces/user';
import { parseHexToRGB } from '@/lib/utils';
import { getUserRank, setDiscordUser } from '@/services/user';

import { log, reply, useBrowser } from '../helpers';

export const Profile = {
  data: new SlashCommandBuilder()
    .setName(COPY.PROFILE.NAME)
    .setDescription(COPY.PROFILE.DESCRIPTION),
  execute: async (
    interaction: ChatInputCommandInteraction,
    user: UserDocument
  ) => {
    if (!CONFIG.FEATURES.PROFILE.ENABLED) {
      reply({
        content: COPY.DISABLED,
        ephemeral: true,
        interaction: interaction,
      });
      return;
    }

    await interaction.deferReply();

    const member = await interaction.guild?.members.fetch(interaction.user.id);

    if (!member) {
      await interaction.editReply({
        content: 'Failed to generate profile image: Member not found.',
      });
      return;
    }

    const userRank = (await getUserRank(user.cash)) ?? 'N/A';

    const whiteRGB = { r: 248, g: 248, b: 255 };
    const roleColorRGB = parseHexToRGB(member.displayHexColor);

    const rgb = roleColorRGB
      ? {
          r: (whiteRGB.r + roleColorRGB.r) / 2,
          g: (whiteRGB.g + roleColorRGB.g) / 2,
          b: (whiteRGB.b + roleColorRGB.b) / 2,
        }
      : whiteRGB;

    const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

    const htmlContent = `
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300..600&display=swap');
          #profile {
            background: linear-gradient(180deg, #f8f8ff 0%, ${rgbString} 80%, ${
      member.displayHexColor
    } 100%);
            font-family: 'Figtree', sans-serif;
            padding: 12px 17px;
            position: relative;
            width: 400px;
          }
          .membership {
            font-size: 10px;
            font-weight: 300;
            margin: 0;
            position: absolute;
            right: 17px;
            top: 17px;
          }
          .content {
            display: flex;
          }
          .avatar {
            align-items: center;
            border-radius: 100%;
            display: flex;
            justify-content: center;
            margin: 0;
          }
          .avatar > img {
            border-radius: 100%;
            height: 112px;
            width: 112px;
          }
          .info {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            justify-content: center;
            margin-left: 15px;
            text-align: left;
          }
          .info p {
            margin: 0;
          }
          .name {
            font-size: 26px;
            font-weight: 600;
            margin: 0;
          }
          .username {
            font-size: 14px;
            font-weight: 300;
          }
          .values {
            display: flex;
            gap: 10px;
            margin-top: 10px;
          }
          .balance > p {
            align-items: center;
            display: flex;
            font-size: 16px;
            gap: 3px;
          }
          .stars {
            align-items: center;
            display: flex;
            font-size: 16px;
            gap: 3px;
          }
          .rank {
            font-size: 10px;
            margin: 0;
            position: absolute;
            bottom: 17px;
            right: 17px;
          }
          .rank > span {
            font-size: 20px;
          }
        </style>
      </head>
      <body>
        <div id="profile">
          <p class="membership">MEMBER SINCE ${
            MONTH_MAP[member.joinedAt?.getMonth() || 0]
          } ${member.joinedAt?.getFullYear()}</p>
          <div class="content">
            <figure class="avatar">
              <img alt="avatar" src="${member.displayAvatarURL({
                size: 256,
              })}" />
            </figure>
            <div class="info">
              <h1 class="name">${member.displayName}</h1>
              <p class="username">${interaction.user.username}</p>
              <div class="values">
                <div class="balance">
                  <p class="cash">
                    ${SilverIcon(20, 20)}
                    <span>${user.cash}</span>
                  </p>
                </div>
                <div class="stars">
                  ${StarIcon(20, 20)}
                  <span>${user.stars ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
          <p class="rank">RANK #<span>${userRank}</span></p>
        </div>
      </body>
      </html>
    `;

    await useBrowser(async browser => {
      const page = await browser.newPage();

      await page.setViewport({
        width: 2560,
        height: 1440,
        deviceScaleFactor: 2,
      });

      await page.setContent(htmlContent);

      await page.evaluate(async () => {
        await document.fonts.ready;
      });

      await page.waitForSelector('#profile');
      const element = await page.$('#profile');

      if (element) {
        const boundingBox = await element.boundingBox();
        if (boundingBox) {
          const buffer = Buffer.from(
            await page.screenshot({
              clip: boundingBox,
              type: 'png',
              fullPage: false,
            })
          );

          await page.close();

          const attachment = new AttachmentBuilder(buffer, {
            name: 'profile.png',
          });

          try {
            await interaction.editReply({ files: [attachment] });

            if (user.discord_name !== member.displayName) {
              await setDiscordUser(interaction.user.id, {
                discord_name: member.displayName,
              });
            }
          } catch (error) {
            log({
              type: LogCode.Error,
              description: JSON.stringify(error),
            });
          }

          return;
        }
      }

      await page.close();

      await interaction.editReply({
        content: 'Failed to generate profile image.',
      });
    });
  },
  getName: (): string => {
    return COPY.PROFILE.NAME;
  },
};
