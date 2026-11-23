require "rails_helper"

RSpec.describe Task, type: :model do
  let(:user) { User.create!(email_address: "owner@example.com", password: "password1") }

  subject(:task) { described_class.new(title: "Buy milk", user: user) }

  it "is valid with title and user" do
    expect(task).to be_valid
  end

  it "defaults status to pending" do
    expect(task.status).to eq("pending")
  end

  it "requires a title" do
    task.title = ""
    expect(task).not_to be_valid
    expect(task.errors).to have_key(:title)
  end

  it "requires a user" do
    task.user = nil
    expect(task).not_to be_valid
    expect(task.errors).to have_key(:user)
  end

  it "rejects unknown status" do
    task.status = "archived"
    expect(task).not_to be_valid
    expect(task.errors).to have_key(:status)
  end

  it "accepts all defined statuses" do
    %w[pending in_progress done].each do |status|
      task.status = status
      expect(task).to be_valid
    end
  end

  it "is destroyed with its user" do
    task.save!
    expect { user.destroy }.to change(described_class, :count).by(-1)
  end

  describe ".with_status" do
    let!(:pending_task) { user.tasks.create!(title: "Pending") }
    let!(:done_task) { user.tasks.create!(title: "Done", status: :done) }

    it "returns tasks with the given status" do
      expect(described_class.with_status("done")).to contain_exactly(done_task)
    end

    it "accepts a symbol" do
      expect(described_class.with_status(:pending)).to contain_exactly(pending_task)
    end

    it "returns all tasks when status is blank" do
      expect(described_class.with_status(nil)).to contain_exactly(pending_task, done_task)
      expect(described_class.with_status("")).to contain_exactly(pending_task, done_task)
    end
  end

  describe ".with_filter" do
    let!(:pending_task) { user.tasks.create!(title: "Pending") }
    let!(:progress_task) { user.tasks.create!(title: "WIP", status: :in_progress) }
    let!(:done_task) { user.tasks.create!(title: "Done", status: :done) }

    it("open excludes done") { expect(described_class.with_filter("open")).to contain_exactly(pending_task, progress_task) }
    it("done returns done") { expect(described_class.with_filter("done")).to contain_exactly(done_task) }

    it("all/blank returns all") do
      expect(described_class.with_filter("all")).to contain_exactly(pending_task, progress_task, done_task)
      expect(described_class.with_filter(nil)).to contain_exactly(pending_task, progress_task, done_task)
    end
  end
end
