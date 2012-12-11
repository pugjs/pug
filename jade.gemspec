require "json"
package_info = JSON.load open(File.expand_path("../package.json", __FILE__)).read

RUBY_LIB_PATH = File.join("support", "ruby")

Gem::Specification.new do |gem|
  gem.name     = "jade-js-source"
  gem.summary  = package_info["description"]
  gem.authors  = [package_info["author"]]
  gem.homepage = "http://jade-lang.com/"

  gem.version  = package_info["version"]
  gem.platform = Gem::Platform::RUBY

  gem.files         = ["jade.js", "runtime.js", File.join(RUBY_LIB_PATH, "jade_js", "source.rb")]
  gem.require_paths = [RUBY_LIB_PATH]
end
