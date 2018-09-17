class CreateHighlights < ActiveRecord::Migration
  def change
    create_table :highlights do |t|
      t.references :resource
      t.text       :note
      t.timestamps
    end
  end
end
