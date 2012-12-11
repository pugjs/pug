module JadeJs
  module Source

    def self.bundled_path
      File.expand_path("../../../../jade.js", __FILE__)
    end

    def self.bundled_runtime_path
      File.expand_path("../../../../runtime.js", __FILE__)
    end

  end
end
