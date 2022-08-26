require "securerandom"

class Game < ApplicationRecord
  before_create :add_code

  def full?
    player_count == 2
  end

  def empty?
    player_count == 0
  end

  def player_count
    if player1.nil? && player2.nil?
      return 0
    elsif player1.present? && player2.present?
      return 2
    end
    1
  end

  def finished?
    player1_choice.present? && player2_choice.present?
  end

  def add_player(player_id)
    return if player1 == player_id || player2 == player_id
    if player1.nil?
      update_attribute(:player1, player_id)
    else
      update_attribute(:player2, player_id)
    end
  end

  def update_score
    return self if player1_choice == player2_choice
    if [
      player1_choice == "rock" && player2_choice == "scissors",
      player1_choice == "paper" && player2_choice == "rock",
      player1_choice == "scissors" && player2_choice == "paper",
    ].any?
      increment(:player1_wins)
    else
      increment(:player2_wins)
    end
  end

  def reset_choices
    update(player1_choice: nil, player2_choice: nil)
  end

  def reset_wins
    self.update(player1_wins: 0, player2_wins: 0)
  end

  def remove_player(player_id)
    if player1 == player_id
      update_attribute(:player1, nil)
    else
      update_attribute(:player2, nil)
    end
  end

  def update_choice(player_id, choice)
    if player1 == player_id
      update_attribute(:player1_choice, choice)
    else
      update_attribute(:player2_choice, choice)
    end
  end

  private

  def add_code
    code = nil
    loop do
      code = SecureRandom.hex[0..7]
      exists = Game.exists?(code: code)
      break unless exists
    end
    self.code = code
  end
end
