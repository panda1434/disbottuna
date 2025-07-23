import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('mention')
  .setDescription('指定したユーザーを指定回数メンションします（1回目はBotの返信にリプライ）')
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

  // 🔹 説明メッセージを先に送る（fetchReply で Message を取得）
  const rootMessage = await interaction.reply({
    content: `${user} を ${count} 回メンションします！`,
    fetchReply: true
  });

  // 🔹 1回目のメンションは rootMessage にリプライ
  let previousMessage = await interaction.channel.send({
    content: `${user}`,
    reply: {
      messageReference: rootMessage.id
    }
  });

  // 🔹 2回目以降は、前のメッセージにリプライしていく
  for (let i = 1; i < count-1; i++) {
    previousMessage = await interaction.channel.send({
      content: `${user}`,
      reply: {
        messageReference: previousMessage.id
      }
    });
  }
}
