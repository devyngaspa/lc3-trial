class AddContentAndRangeToHighlights < ActiveRecord::Migration
  def change
    add_column :highlights, :content, :text
    add_column :highlights, :range, :string
  end
end
