/**
 * Module dependencies.
 */

// @ts-expect-error TS(2591): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const uubench = require("uubench"),
	// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'pug'.
	pug = require("../");

const suite = new uubench.Suite({
	min: 200,
	result(name: any, stats: any) {
		const persec = 1000 / stats.elapsed,
			ops = stats.iterations * persec;
		console.log("%s: %d", name, ops | 0);
	},
});

function setup(self: any) {
	const suffix = self ? " (self)" : "",
		options = { self };

	let str = "html\n  body\n    h1 Title",
		fn = pug.compile(str, options);

	suite.bench(`tiny${suffix}`, (next: any) => {
		fn();
		next();
	});

	str =
		'\
html\n\
  body\n\
    h1 Title\n\
    ul#menu\n\
      li: a(href="#") Home\n\
      li: a(href="#") About Us\n\
      li: a(href="#") Store\n\
      li: a(href="#") FAQ\n\
      li: a(href="#") Contact\n\
';

	const fn2 = pug.compile(str, options);

	suite.bench(`small${suffix}`, (next: any) => {
		fn2();
		next();
	});

	str =
		'\
html\n\
  body\n\
    h1 #{title}\n\
    ul#menu\n\
      - each link in links\r\n\
        li: a(href="#")= link\r\n\
';

	if (self) {
		str =
			'\
html\n\
  body\n\
    h1 #{self.title}\n\
    ul#menu\n\
      - each link in self.links\r\n\
        li: a(href="#")= link\r\n\
';
	}

	const fn3 = pug.compile(str, options);

	suite.bench(`small locals${suffix}`, (next: any) => {
		fn3({
			title: "Title",
			links: ["Home", "About Us", "Store", "FAQ", "Contact"],
		});
		next();
	});

	str =
		'\
html\n\
  body\n\
    h1 Title\n\
    ul#menu\n\
      li: a(href="#") Home\n\
      li: a(href="#") About Us\n\
      li: a(href="#") Store\n\
      li: a(href="#") FAQ\n\
      li: a(href="#") Contact\n\
';

	str = Array(30).join(str);
	const fn4 = pug.compile(str, options);

	suite.bench(`medium${suffix}`, (next: any) => {
		fn4();
		next();
	});

	str =
		'\
html\n\
  body\n\
    h1 Title\n\
    ul#menu\n\
      li: a(href="#") Home\n\
      li: a(href="#") About Us\n\
      li: a(href="#") Store\n\
      li: a(href="#") FAQ\n\
      li: a(href="#") Contact\n\
';

	str = Array(100).join(str);
	const fn5 = pug.compile(str, options);

	suite.bench(`large${suffix}`, (next: any) => {
		fn5();
		next();
	});
}

// @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
setup();
setup(true);

suite.run();
