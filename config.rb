require 'autoprefixer-rails'
require 'csso'

on_stylesheet_saved do |file|
  css = File.read(file)
  File.open(file, 'w') do |io|
    io << Csso.optimize( AutoprefixerRails.compile(css) )
  end
end

require 'sass-css-importer'
add_import_path Sass::CssImporter::Importer.new("./bower_components/")

css_dir = "css"
sass_dir = "_sass"
output_style = :compressed