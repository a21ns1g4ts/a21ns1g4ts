module Jekyll
  class Environment < Generator
    def generate(site)
      site.config['google_analytics_ua'] = ENV['JEKYLL_GOOGLE_ANALYTICS_UA']
    end
  end
end