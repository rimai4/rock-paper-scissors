import consumer from './consumer';

export function subscribe({ game_id, player_id }) {
  const channel = consumer.subscriptions.create(
    { channel: 'GameChannel', game_id, player_id },
    {
      connected() {
        console.log('connected');
        channel.perform('join', { player_id });
      },

      disconnected() {},
    },
  );
  return channel;
}
