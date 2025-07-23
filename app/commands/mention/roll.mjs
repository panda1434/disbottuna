import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('roll')
  .setDescription('リアクションで抽選イベントを作成します。')
  .addIntegerOption(option =>
    option.setName('time')
      .setDescription('抽選の期限（分） 最大120')
      .setRequired(true))
  .addIntegerOption(option =>
    option.setName('number')
      .setDescription('抽選で選ばれる人数')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('prize')
      .setDescription('景品の内容')
      .setRequired(true));

export async function execute(interaction) {
  const time = interaction.options.getInteger('time');
  const number = interaction.options.getInteger('number');
  const prize = interaction.options.getString('prize');

  if (time > 120 || time <= 0) {
    return interaction.reply({ content: '時間は1〜120分の間で指定してください。', ephemeral: true });
  }

  if (number <= 0) {
    return interaction.reply({ content: '当選人数は1以上にしてください。', ephemeral: true });
  }

  const deadline = new Date(Date.now() + time * 60 * 1000);
  const deadlineString = deadline.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  const message = await interaction.reply({
    content:
      `🎉 このメッセージにリアクションで抽選に参加 🎉\n` +
      `⏰ 期限: ${deadlineString}\n` +
      `👥 人数: ${number}人\n` +
      `🎁 景品: ${prize}`,
    fetchReply: true,
  });

  try {
    await message.react('🎲');
  } catch (error) {
    console.error('リアクションエラー:', error);
  }

  setTimeout(async () => {
    try {
      const fetchedMessage = await message.fetch();
      const reaction = fetchedMessage.reactions.cache.get('🎲');
      if (!reaction) return;

      const users = await reaction.users.fetch();
      const filtered = users.filter(user => !user.bot);
      const entries = Array.from(filtered.values());

      if (entries.length === 0) {
        await interaction.followUp('誰も参加しませんでした。😢');
        return;
      }

      const winners = [];
      while (winners.length < number && entries.length > 0) {
        const index = Math.floor(Math.random() * entries.length);
        winners.push(entries.splice(index, 1)[0]);
      }

      const mentions = winners.map(user => `<@${user.id}>`).join('、');

      // 元メッセージに「当選者」追記
      await fetchedMessage.edit({
        content: `${fetchedMessage.content}\n🏆 当選者: ${mentions}`,
      });

      // 念のため followUp でも通知
      await interaction.followUp(`${mentions} さん、おめでとうございます！🎉\n🎁 景品: ${prize}`);
    } catch (err) {
      console.error('抽選エラー:', err);
    }
  }, time * 60 * 1000); // 分 → ミリ秒
}
