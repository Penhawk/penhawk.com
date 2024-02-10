###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

# With alternative layout
# page "/path/to/file.html", layout: :otherlayout

# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", locals: {
#  which_fake_page: "Rendering a fake page with a local variable" }

# General configuration

# Reload the browser automatically whenever files change
configure :development do
  activate :livereload
end

###
# Helpers
###

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end

configure :build do
  activate :minify_css
  activate :minify_javascript
end

activate :minify_html

activate :blog do |blog|
  blog.name = "blog"
    blog.prefix = "blog"
    blog.permalink = "{title}"
    blog.layout = "blog-layout"
    blog.new_article_template = File.expand_path('source/blog-template.erb', File.dirname(__FILE__))
end

set :images_dir, 'images/blog-images'

activate :directory_indexes


# Build-specific configuration
configure :build do
  # Minify CSS on build
  # activate :minify_css

  # Minify Javascript on build
  # activate :minify_javascript
end

page "/sitemap.xml", :layout => false

# Sitemap
set :url_root, 'https://penhawk.com/'
activate :search_engine_sitemap
