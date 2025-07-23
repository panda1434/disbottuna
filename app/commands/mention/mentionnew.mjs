import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('oldmention')
  .setDescription('1つのメッセージで複数回メンションします')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('メンションするユーザー')
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option.setName('count')
      .setDescription('メンションする回数（1〜15）')
      .setRequired(true)
  );

export async function execute(interaction) {
  const user = interaction.options.getUser('user');
  const count = interaction.options.getInteger('count');

  if (count < 1 || count > 15) {
    await interaction.reply({
      content: 'メンション回数は1〜15の間で指定してください。',
      ephemeral: true
    });
    return;
  }

  // 🔹 メンション文字列を count 回分作成
  const mentions = Array(count).fill(`${user}`).join(' ');

  await interaction.reply({
    content: `${user} を ${count} 回メンションします！ ${mentions}`
  });
}
