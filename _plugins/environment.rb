module Jekyll
  class EnvironmentBlock < Liquid::Block

    def initialize(tag_name, args, tokens)
      super
      @env = args.strip
    end

    def render(context)
      env = context.registers[:site].config["port"] == 80 ? "prod" : "dev"
      super if env == @env
    end

  end
end

Liquid::Template.register_tag('env', Jekyll::EnvironmentBlock)