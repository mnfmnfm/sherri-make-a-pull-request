Rails.application.routes.draw do

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  devise_for :users, :controllers => { registrations: "users/registrations", sessions: "users/sessions" }
  root :to => redirect("/users/sign_in")
  delete "/routes/:id/nodes/clear", to: "routes#destroy_all_nodes"
  post "/routes/gps/",to:"routes#get_file"
  resources :routes do
    resources :nodes
  end
  # get "/:id/routes", to: "routes#index"
  resources :dashboard, only: [:index]


end
