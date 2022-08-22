import { Controller } from '@hotwired/stimulus';
import { subscribe } from '../channels/game_channel';

// Connects to data-controller="games"
export default class extends Controller {
  static values = { id: String };
  static targets = ['button', 'waiting'];

  connect() {
    let playerId = window.localStorage.getItem('PLAYER_ID');
    if (!playerId) {
      playerId = Math.random().toString(36).slice(2, 12);
      window.localStorage.setItem('PLAYER_ID', playerId);
    }
    this.channel = subscribe({ game_id: this.idValue, player_id: playerId });
  }

  choose(event) {
    console.log('EVENT', event);
    this.channel.perform('choose', { choice: event.params.choice });
  }
}
