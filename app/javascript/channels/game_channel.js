import consumer from './consumer';

export function subscribe(params = {}) {
  const channel = consumer.subscriptions.create(
    { channel: 'GameChannel', ...params },
    {
      connected() {
        console.log('connected');
        channel.perform('join', { player_id: params.player_id });
      },

      disconnected() {},

      received(data) {
        console.log('received data', data);
      },
    },
  );
  return channel;
}
