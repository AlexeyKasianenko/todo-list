class UsersController < ApplicationController
  allow_unauthenticated_access only: :create
  rate_limit to: 10, within: 3.minutes, only: :create,
             with: -> { render json: { error: "Try again later." }, status: :too_many_requests }

  def create
    user = User.new(user_params)

    if user.save
      render json: user.as_json(only: %i[id email_address created_at]), status: :created
    else
      render json: { errors: user.errors }, status: :unprocessable_content
    end
  end

  private
    def user_params
      params.expect(user: %i[email_address password password_confirmation])
    end
end
