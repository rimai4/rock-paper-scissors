import React from 'react';
import { createRoot } from 'react-dom/client';
import { Controller } from '@hotwired/stimulus';
import Game from '../components/game';
import { subscribe } from '../channels/game_channel';

// Connects to data-controller="games"
export default class extends Controller {
  static values = { id: String };

  connect() {
    let playerId = window.localStorage.getItem('PLAYER_ID');
    if (!playerId) {
      playerId = Math.random().toString(36).slice(2, 12);
      window.localStorage.setItem('PLAYER_ID', playerId);
    }
    const channel = subscribe({ game_id: this.idValue, player_id: playerId });
    createRoot(this.element).render(<Game channel={channel} playerId={playerId} />);
  }
}
