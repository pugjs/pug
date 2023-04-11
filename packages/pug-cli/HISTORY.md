# Change Log
As with most npm modules, this project adheres to
[Semantic Versioning](http://semver.org/).

## [1.0.0-alpha6] - 2016-06-01

### Added
- `--basedir` option is added for easier specification of that Pug option.
- Node.js v6 is now tested.

## [1.0.0-alpha5] - 2016-05-18

### Changed
- Files ending `.jade` are now recognized as Pug templates when a directory is provided as input.

## [1.0.0-alpha4] - 2016-05-18

### Changed
- When `--watch` is specified, `watch` is no longer passed as an option to Pug. This should have no effect on users.

### Fixed
- Fixed `--no-debug` option ([#23])

## [1.0.0-alpha3] - 2016-05-18

### Added
- Node.js module as option file is supported as well.
- Some examples have been added to the documentation on how to use `-O`.

## [1.0.0-alpha2] - 2016-05-18

### Changed
- Pug has been updated to the latest alpha.
- Unused dependencies have been removed.

## [1.0.0-alpha1] - 2016-03-23

### Removed
- `-H` option, deprecated in 0.1.0, has been removed.
- Support for `SIGINT` as signal for EOF, deprecated in 0.1.1, has been removed.

### Changed
- The package is renamed to `pug-cli`.

### Fixed
- Support for Windows has been fixed.

## [0.1.1] - 2015-09-29
### Deprecated
- Using `SIGINT` (`^C`) to signify end of input in standard input mode is deprecated, and will be removed in 1.0.0. Instead, use `^D` which means "end of file."

### Fixed
- Fallback on options specified with `-O` if the corresponding CLI option is not specified.
- Mark this module as preferred to be installed globally.
- Fix copyright and update maintainers in package.json.
- Fix links in HISTORY.md.
- Fix compiling directories whose paths contain backslashes (`\`) (#11).

## [0.1.0] - 2015-07-24
### Added
- Silent mode (`-s`, `--silent`) which disables printing unimportant messages (#3, pugjs/pug#1905).

### Changed
- Hierarchy mode (`-H`, `--hierarchy`) is made the default.
- Both versions of Pug and the CLI are printed with `-V` or `--version`.
- Unescaped Unicode line and paragraph separators (`U+2028` and `U+2029`) is now allowed in the `-O` option only when the input is considered to be JSON (#5, pugjs/pug#1949).
- Non-JSON object files are allowed for the `-O` option as long as it can be parsed with the `eval()` function.

### Deprecated
- Since the hierarchy mode (`-H`, `--hierarchy`) is made the default, the
  option is now redundant and will be removed in 1.0.0.

### Fixed
- Capitalization in help message is kept consistent.
- Fix grammar error in the help message (by @didoarellano).
- Fix watch mode in more than one level of dependency hierarchy (pugjs/pug#1888).

## 0.0.1 - 2015-06-02
### Added
- Initial release.

[unreleased]: https://github.com/pugjs/pug-cli/compare/1.0.0-alpha5...master
[1.0.0-alpha5]: https://github.com/pugjs/pug-cli/compare/1.0.0-alpha4...1.0.0-alpha5
[1.0.0-alpha4]: https://github.com/pugjs/pug-cli/compare/1.0.0-alpha3...1.0.0-alpha4
[1.0.0-alpha3]: https://github.com/pugjs/pug-cli/compare/1.0.0-alpha2...1.0.0-alpha3
[1.0.0-alpha2]: https://github.com/pugjs/pug-cli/compare/1.0.0-alpha1...1.0.0-alpha2
[1.0.0-alpha1]: https://github.com/pugjs/pug-cli/compare/0.1.1...1.0.0-alpha1
[0.1.1]: https://github.com/pugjs/pug-cli/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/pugjs/pug-cli/compare/0.0.1...0.1.0

[#23]: https://github.com/pugjs/pug-cli/issues/23
