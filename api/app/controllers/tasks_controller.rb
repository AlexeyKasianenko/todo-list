class TasksController < ApplicationController
  PER_PAGE = 10
  FILTERS = %w[all open done].freeze

  before_action :set_task, only: %i[show update destroy]

  def index
    tasks = Current.user.tasks.order(created_at: :desc, id: :desc)

    if params[:filter].present?
      return render_invalid_filter unless FILTERS.include?(params[:filter])

      tasks = tasks.with_filter(params[:filter])
    end

    response.headers["X-All-Count"] = Current.user.tasks.count.to_s
    response.headers["X-Done-Count"] = Current.user.tasks.done.count.to_s
    response.headers["X-Total-Count"] = tasks.count.to_s
    tasks = tasks.limit(PER_PAGE).offset((page_num - 1) * PER_PAGE)

    render json: tasks.map { |task| serialize(task) }
  end

  def show
    render json: serialize(@task)
  end

  def create
    task = Current.user.tasks.new(task_params)

    if task.save
      render json: serialize(task), status: :created
    else
      render json: { errors: task.errors }, status: :unprocessable_content
    end
  end

  def update
    if @task.update(task_params)
      render json: serialize(@task)
    else
      render json: { errors: @task.errors }, status: :unprocessable_content
    end
  end

  def destroy
    @task.destroy!
    head :no_content
  end

  private
    def set_task
      @task = Current.user.tasks.find_by(id: params[:id])
      render json: { error: "Not found" }, status: :not_found unless @task
    end

    def page_num
      params[:page_num].to_i.clamp(1, 1_000_000)
    end

    def task_params
      params.expect(task: %i[title status note])
    end

    def serialize(task)
      task.as_json(only: %i[id title status note created_at updated_at])
    end

    def render_invalid_filter
      render json: { errors: { filter: [ "must be one of: #{FILTERS.join(', ')}" ] } },
             status: :unprocessable_content
    end

    def render_invalid_status
      render json: { errors: { status: [ "must be one of: #{Task.statuses.keys.join(', ')}" ] } },
             status: :unprocessable_content
    end
end
