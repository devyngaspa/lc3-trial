class HighlightsController < ApplicationController

  def index
    @highlights = Highlight.all.order(:created_at)

    respond_to do |format|
      format.html
      format.json { render json: @highlights }
    end
  end

  def fetch
    resource_id = params[:resource_id]
    @highlights = Highlight.where(resource_id: resource_id).order(:created_at)
    respond_to do |format|
      format.html
      format.json { render json: @highlights }
    end
  end

  def show
    @highlight = Highlight.find(params[:id])
  end

  def create
    @highlight = Highlight.create(highlight_params)
    render json: @highlight
  end

  def destroy
    @highlight = Highlight.find(params[:id])
    @highlight.destroy
    render json: {}
  end

  private

  def highlight_params
    params.require(:highlight).permit(:offset, :content, :resource_id)
  end

end
