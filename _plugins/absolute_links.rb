module Jekyll
  module AbsoluteLinks
    def absolute(input)
      config = @context.registers[:site].config
      dev_mode = config["port"] != 80

      # Add the appropriate domain
      if dev_mode
        url = "#{input}"
      else
        url = "#{config['url']}#{input}"
      end

      # remove "index.html" if found
      url.gsub!(/\/index.html$/, "")

      # add trailing slash if the url is a directory and not a file
      unless url =~ /(\.(html|css|js|png|jpg|gif)$|\/$)/
        url += "/"
      end

      url

    end
  end
end

Liquid::Template.register_filter(Jekyll::AbsoluteLinks)