class GameChannel < ApplicationCable::Channel
  def subscribed
    @player_id = player_id
    stream_from game_channel
  end

  def unsubscribed
    p "unsubscribed, removing player #{@player_id}"
    game = Game.find_by!(code: game_id)
    game.update(player1_choice: nil, player2_choice: nil)
    if game.player1 == @player_id
      game.update_attribute(:player1, nil)
    else
      game.update_attribute(:player2, nil)
    end
    ActionCable.server.broadcast(game_channel, { event: "PLAYER_LEFT", player_id: @player_id })
  end

  def receive(data)
  end

  def join
    game = Game.find_by!(code: game_id)
    return if game.player1 == @player_id || game.player2 == @player_id
    if game.player1.nil?
      game.update_attribute(:player1, @player_id)
    else
      game.update_attribute(:player2, @player_id)
    end
    ActionCable.server.broadcast(game_channel, { event: "PLAYER_JOINED", full: game.full? })
  end

  def choose(data)
    game = Game.find_by!(code: game_id)
    choice = data["choice"]
    if game.player1 == @player_id
      game.update_attribute(:player1_choice, choice)
    else
      game.update_attribute(:player2_choice, choice)
    end

    if game.player1_choice && game.player2_choice
      ActionCable.server.broadcast(game_channel, {
        event: "GAME_FINISHED",
        player1: game.player1,
        player2: game.player2,
        player1_choice: game.player1_choice,
        player2_choice: game.player2_choice,
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

  def player_id
    params[:player_id]
  end
end