require 'rubygems'
require 'erb'
require 'fileutils'
require 'rake/testtask'
require 'json'

desc "Build jade-js-source gem"
task :gem do
  require 'rubygems'
  require 'rubygems/package'

  gemspec = Gem::Specification.new do |s|
    s.name      = 'jade-js-source'
    s.version   = JSON.parse(File.read('package.json'))["version"]
    s.date      = Time.now.strftime("%Y-%m-%d")

    s.homepage    = "https://github.com/visionmedia/jade"
    s.summary     = "Jade - template engine"
    s.description = <<-EOS
      Jade is a high performance template engine heavily influenced by Haml 
      and implemented with JavaScript for node.
    EOS

    s.files = [
      'lib/jade_js/jade.js',
      'lib/jade_js/source.rb'
    ]

    s.authors           = ['TJ Holowaychuk', 'David Haslem']
    s.email             = 'therabidbanana@gmail.com'
    s.rubyforge_project = 'jade-js-source'
  end

  file = File.open("support/ruby-pkg/jade-js-source.gem", "w")
  Gem::Package.open(file, 'w') do |pkg|
    pkg.metadata = gemspec.to_yaml

    path = "lib/jade_js/source.rb"
    contents = <<-ERUBY
module JadeJs
  module Source
    def self.bundled_path
      File.expand_path("../jade.js", __FILE__)
    end
  end
end
    ERUBY
    pkg.add_file_simple(path, 0644, contents.size) do |tar_io|
      tar_io.write(contents)
    end

    contents = File.read("jade.js")
    path = "lib/jade_js/jade.js"
    pkg.add_file_simple(path, 0644, contents.size) do |tar_io|
      tar_io.write(contents)
    end
  end
end

