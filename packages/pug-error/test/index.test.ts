// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'error'.
const error = require("../");

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("with a source", () => {
	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test("and a filename", () => {
		const err = error("MY_CODE", "My message", {
			line: 3,
			filename: "myfile",
			src: "foo\nbar\nbaz\nbash\nbing",
		});
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.message).toBe("myfile:3\n    1| foo\n    2| bar\n  > 3| baz\n    4| bash\n    5| bing\n\nMy message");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.code).toBe("PUG:MY_CODE");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.msg).toBe("My message");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.line).toBe(3);
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.filename).toBe("myfile");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.src).toBe("foo\nbar\nbaz\nbash\nbing");
	});
	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test("and no filename", () => {
		const err = error("MY_CODE", "My message", {
			line: 3,
			src: "foo\nbar\nbaz\nbash\nbing",
		});
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.message).toBe("Pug:3\n    1| foo\n    2| bar\n  > 3| baz\n    4| bash\n    5| bing\n\nMy message");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.code).toBe("PUG:MY_CODE");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.msg).toBe("My message");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.line).toBe(3);
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.filename).toBe(undefined);
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.src).toBe("foo\nbar\nbaz\nbash\nbing");
	});
});

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("without source", () => {
	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test("and with a filename", () => {
		const err = error("MY_CODE", "My message", { line: 3, filename: "myfile" });
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.message).toBe("myfile:3\n\nMy message");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.code).toBe("PUG:MY_CODE");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.msg).toBe("My message");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.line).toBe(3);
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.filename).toBe("myfile");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.src).toBe(undefined);
	});
	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test("and with no filename", () => {
		const err = error("MY_CODE", "My message", { line: 3 });
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.message).toBe("Pug:3\n\nMy message");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.code).toBe("PUG:MY_CODE");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.msg).toBe("My message");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.line).toBe(3);
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.filename).toBe(undefined);
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.src).toBe(undefined);
	});
});

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("with column", () => {
	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test("and with a filename", () => {
		const err = error("MY_CODE", "My message", {
			line: 3,
			column: 2,
			filename: "myfile",
			src: "foo\nbar\nbaz\nbash\nbing",
		});
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.message).toBe(
			"myfile:3:2\n    1| foo\n    2| bar\n  > 3| baz\n--------^\n    4| bash\n    5| bing\n\nMy message"
		);
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.code).toBe("PUG:MY_CODE");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.msg).toBe("My message");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.line).toBe(3);
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.filename).toBe("myfile");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.src).toBe("foo\nbar\nbaz\nbash\nbing");
	});
	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test("and with no filename", () => {
		const err = error("MY_CODE", "My message", { line: 3, column: 1 });
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.message).toBe("Pug:3:1\n\nMy message");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.code).toBe("PUG:MY_CODE");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.msg).toBe("My message");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.line).toBe(3);
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.filename).toBe(undefined);
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.src).toBe(undefined);
	});
});

// @ts-expect-error TS(2593): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("invalid information", () => {
	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test("negative column", () => {
		const err = error("MY_CODE", "My message", {
			line: 3,
			column: -1,
			src: "foo\nbar\nbaz\nbash\nbing",
		});
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.message).toBe("Pug:3:-1\n    1| foo\n    2| bar\n  > 3| baz\n    4| bash\n    5| bing\n\nMy message");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.code).toBe("PUG:MY_CODE");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.msg).toBe("My message");
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.line).toBe(3);
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.filename).toBe(undefined);
		// @ts-expect-error TS(2304): Cannot find name 'expect'.
		expect(err.src).toBe("foo\nbar\nbaz\nbash\nbing");
	});
	// @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
	test("out of range line", () => {
		check(0);
		check(6);

		function check(line: any) {
			const err = error("MY_CODE", "My message", {
				line,
				src: "foo\nbar\nbaz\nbash\nbing",
			});
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(err.message).toBe(`Pug:${line}\n\nMy message`);
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(err.code).toBe("PUG:MY_CODE");
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(err.msg).toBe("My message");
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(err.line).toBe(line);
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(err.filename).toBe(undefined);
			// @ts-expect-error TS(2304): Cannot find name 'expect'.
			expect(err.src).toBe("foo\nbar\nbaz\nbash\nbing");
		}
	});
});
