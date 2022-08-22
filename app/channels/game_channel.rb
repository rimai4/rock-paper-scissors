class GameChannel < ApplicationCable::Channel
  def subscribed
    @player_id = player_id
    stream_from game_channel
  end

  def unsubscribed
    p "unsubscribed, removing player #{@player_id}"
    game = Game.find_by!(code: game_id)
    if game.player1 == @player_id
      game.update_attribute(:player1, nil)
    else
      game.update_attribute(:player2, nil)
    end
  end

  def receive(data)
  end

  def join
    game = Game.find_by!(code: game_id)
    if game.player1.nil? && game.player1 != @player_id
      game.update_attribute(:player1, @player_id)
    elsif game.player2 != @player_id
      game.update_attribute(:player2, @player_id)
    end
    ActionCable.server.broadcast(game_channel, { event: "PLAYER_JOINED", full: game.full? })
  end

  def choose(data)
    game = Game.find_by!(code: game_id)
    if game.player1 == @player_id
      game.update_attribute(:player1_choice, data["choice"])
    else
      game.update_attribute(:player2_choice, data["choice"])
    end
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
