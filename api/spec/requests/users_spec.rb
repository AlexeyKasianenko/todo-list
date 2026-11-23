require "rails_helper"

RSpec.describe "Users", type: :request do
  describe "POST /users" do
    let!(:params) do
      { user: { email_address: " NEW@Example.com", password: "password1", password_confirmation: "password1" } }
    end

    subject(:post_user) do
      post users_path, params: params, as: :json
    end

    def json
      response.parsed_body
    end

    it "creates a user and returns 201 with user JSON" do
      expect { post_user }.to change(User, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json.keys).to contain_exactly("id", "email_address", "created_at")
      expect(json["email_address"]).to eq("new@example.com")
    end

    it "does not expose password_digest" do
      post_user
      expect(response.body).not_to include("password_digest")
    end

    it "normalizes email address" do
      post_user
      expect(json["email_address"]).to eq("new@example.com")
    end

    shared_examples "rejected" do |field|
      it "returns 422 with #{field} errors" do
        expect { post_user }.not_to change(User, :count)
        expect(response).to have_http_status(:unprocessable_content)
        expect(json["errors"]).to have_key(field)
      end
    end

    context "missing email" do
      let!(:params) { { user: super()[:user].merge(email_address: "") } }
      include_examples "rejected", "email_address"
    end

    context "invalid email format" do
      let!(:params) { { user: super()[:user].merge(email_address: "not-an-email") } }
      include_examples "rejected", "email_address"
    end

    context "duplicate email (case-insensitive)" do
      before { User.create!(email_address: "new@example.com", password: "password1") }
        let!(:params) { { user: super()[:user].merge(email_address: "NEW@example.com") } }
      include_examples "rejected", "email_address"
    end

    context "short password" do
      let!(:params) { { user: super()[:user].merge(password: "short", password_confirmation: "short") } }
      include_examples "rejected", "password"
    end

    context "mismatched confirmation" do
      let!(:params) { { user: super()[:user].merge(password_confirmation: "different1") } }
      include_examples "rejected", "password_confirmation"
    end

    context "missing user param" do
      let!(:params) { { user: nil } }

      it "returns 400" do
        post_user
        expect(response).to have_http_status(:bad_request)
      end
    end
  end
end
