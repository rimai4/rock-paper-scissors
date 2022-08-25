require "securerandom"

class Game < ApplicationRecord
  before_create :add_code

  def full?
    player1.present? && player2.present?
  end

  def empty?
    player1.nil? && player2.nil?
  end

  def update_score
    return if player1_choice == player2_choice
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
