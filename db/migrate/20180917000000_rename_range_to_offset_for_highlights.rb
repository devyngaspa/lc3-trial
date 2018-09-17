class RenameRangeToOffsetForHighlights < ActiveRecord::Migration
  def change
    rename_column :highlights, :range, :offset
  end
end
