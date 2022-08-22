class CreateGames < ActiveRecord::Migration[7.0]
  def change
    create_table :games do |t|
      t.string :code, null: false
      t.string :player1
      t.string :player2
      t.string :player1_choice
      t.string :player2_choice
      t.timestamps
    end
  end
end
