require "rails_helper"

RSpec.describe "Sessions", type: :request do
  let!(:user) { User.create!(email_address: "owner@example.com", password: "password1") }

  describe "POST /session" do
    it "returns a token for valid credentials" do
      post session_path, params: { email_address: "owner@example.com", password: "password1" }, as: :json

      expect(response).to have_http_status(:created)
      token = response.parsed_body["token"]
      expect(Session.find_signed(token).user).to eq(user)
    end

    it "returns 401 for invalid credentials" do
      post session_path, params: { email_address: "owner@example.com", password: "wrong" }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /session" do
    it "destroys the session and invalidates the token" do
      token = user.sessions.create!.signed_id
      headers = { "Authorization" => "Bearer #{token}" }

      expect { delete session_path, headers: headers, as: :json }.to change(Session, :count).by(-1)
      expect(response).to have_http_status(:no_content)

      get tasks_path, headers: headers, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
