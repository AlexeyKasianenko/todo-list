class Task < ApplicationRecord
  belongs_to :user

  enum :status, { pending: 0, in_progress: 1, done: 2 }, default: :pending, validate: true

  validates :title, presence: true, length: { maximum: 255 }

  scope :with_status, ->(status) { where(status: status) if status.present? }

  scope :with_filter, ->(filter) {
    case filter
    when "open" then where.not(status: :done)
    when "done" then where(status: :done)
    end
  }
end
