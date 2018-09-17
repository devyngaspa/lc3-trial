class HighlightsController < ApplicationController

  def index
    @highlights = Highlight.all.order(:created_at)
  end

  def show
    @highlight = Highlight.find(params[:id])
  end

end
