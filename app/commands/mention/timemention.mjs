import { SlashCommandBuilder } from 'discord.js';
import { DateTime } from 'luxon';

export const data = new SlashCommandBuilder()
  .setName('timemention')
  .setDescription('指定した月日時分に、次にその時が来たらメンションします（3週間以内）')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('メンションするユーザー')
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option.setName('month')
      .setDescription('月（1〜12）')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(12)
  )
  .addIntegerOption(option =>
    option.setName('day')
      .setDescription('日（1〜31）')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(31)
  )
  .addIntegerOption(option =>
    option.setName('hour')
      .setDescription('時（0〜23）')
      .setRequired(true)
      .setMinValue(0)
      .setMaxValue(23)
  )
  .addIntegerOption(option =>
    option.setName('minute')
      .setDescription('分（0〜59）')
      .setRequired(true)
      .setMinValue(0)
      .setMaxValue(59)
  );

export async function execute(interaction) {
  const user = interaction.options.getUser('user');
  const month = interaction.options.getInteger('month');
  const day = interaction.options.getInteger('day');
  const hour = interaction.options.getInteger('hour');
  const minute = interaction.options.getInteger('minute');

  const nowJST = DateTime.now().setZone('Asia/Tokyo');
  const year = nowJST.month > month || (nowJST.month === month && nowJST.day > day) ? nowJST.year + 1 : nowJST.year;

  let target = DateTime.fromObject({
    year,
    month,
    day,
    hour,
    minute,
    zone: 'Asia/Tokyo'
  });

  // バリデーション
  if (!target.isValid) {
    await interaction.reply({ content: `その日付は存在しません（例: 2月30日, 4月31日など）。`, ephemeral: true });
    return;
  }

  const delayMs = target.toMillis() - nowJST.toMillis();
  const maxDelay = 1000 * 60 * 60 * 24 * 21; // 3週間

  if (delayMs > maxDelay) {
    await interaction.reply({ content: '3週間以内の日時を指定してください。', ephemeral: true });
    return;
  }

  const timestamp = Math.floor(target.toSeconds());
  await interaction.reply(`<@${user.id}> を <t:${timestamp}:F> にメンションします！`);

  setTimeout(() => {
    interaction.channel.send(`<@${user.id}> 時間になりました！`);
  }, delayMs);
}
