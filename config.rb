require 'sass-css-importer'
add_import_path Sass::CssImporter::Importer.new("./bower_components/")

css_dir = "css"
sass_dir = "_sass"
output_style = :compressed