require "securerandom"

class Game < ApplicationRecord
  before_create :add_code

  def full?
    player1.present? && player2.present?
  end

  def empty?
    player1.nil? && player2.nil?
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
