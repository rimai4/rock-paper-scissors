class GameChannel < ApplicationCable::Channel
  def subscribed
    @player_id = params[:player_id]
    stream_from game_channel
  end

  def unsubscribed
    p "unsubscribed, removing player #{@player_id}"
    game = Game.find_by!(code: game_id)
    game.remove_player(@player_id)

    if game.has_no_players?
      game.reset_wins
    end

    ActionCable.server.broadcast(game_channel, {
      event: "PLAYER_LEFT",
      player1: game.player1,
      player2: game.player2,
    })
  end

  def receive(data)
  end

  def join
    game = Game.find_by!(code: game_id)
    game.add_player(@player_id)

    ActionCable.server.broadcast(game_channel, {
      event: "PLAYER_JOINED",
      player1: game.player1,
      player2: game.player2,
      player1_wins: game.player1_wins,
      player2_wins: game.player2_wins,
    })
  end

  def choose(data)
    game = Game.find_by!(code: game_id)
    game.update_choice(@player_id, data["choice"])

    if game.finished?
      game.update_score

      ActionCable.server.broadcast(game_channel, {
        event: "GAME_FINISHED",
        player1: game.player1,
        player2: game.player2,
        player1_choice: game.player1_choice,
        player2_choice: game.player2_choice,
        player1_wins: game.player1_wins,
        player2_wins: game.player2_wins,
      })
    end
  end

  def restart
    game = Game.find_by!(code: game_id)
    game.update(player1_choice: nil, player2_choice: nil)
    ActionCable.server.broadcast(game_channel, { event: "RESTART" })
  end

  private

  def game_channel
    "game_#{game_id}"
  end

  def game_id
    params[:game_id]
  end
end
