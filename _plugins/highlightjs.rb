require 'cgi'

module Jekyll
  class HighlightJsBlock < Liquid::Block

    SYNTAX = /^([a-z]*)$/

    def initialize(tag_name, args, tokens)
      super
      if args.strip =~ SYNTAX
        @lang = $1
      else
        raise SyntaxError.new("Syntax Error in 'highlightjs' - Valid syntax: highlightjs [lang]")
      end
    end

    def render(context)
      code = CGI.escapeHTML(super)
      code = code.gsub(/\*\*(.+)\*\*/, "<em>\\1</em>")
      cls = @lang ? " class=\"language-#{@lang}\"" : ""
      "<pre class=\"highlight\"><code#{cls}>#{code.strip}</code></pre>"
    end

  end
end

Liquid::Template.register_tag('highlightjs', Jekyll::HighlightJsBlock)