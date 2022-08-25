class GamesController < ApplicationController
  before_action :set_game, only: :show
  # before_action :check_game_full, only: :show

  def create
    game = Game.create!
    redirect_to game_path(game.code)
  end

  def show
  end

  private

  def set_game
    @game = Game.find_by(code: params[:id])
    unless @game
      flash[:error] = "Potje kon niet worden gevonden."
      redirect_to root_path
    end
  end

  def check_game_full
    if @game.full?
      flash[:error] = "Potje heeft al 2 spelers"
      redirect_to root_path
    end
  end
end
