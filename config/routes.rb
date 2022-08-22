Rails.application.routes.draw do
  root "pages#index"
  resources :games, only: %i[create show]
end
