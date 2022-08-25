class AddWinsToGames < ActiveRecord::Migration[7.0]
  def change
    add_column :games, :player1_wins, :integer, null: false, default: 0
    add_column :games, :player2_wins, :integer, null: false, default: 0
  end
end
