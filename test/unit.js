
var runtime = require('../lib/runtime')
  , merge = runtime.merge
  , DebugItem = runtime.DebugItem;

describe('merge(a, b, escaped)', function(){
  it('should merge classes into strings', function(){
    merge({ foo: 'bar' }, { bar: 'baz' })
      .should.eql({ foo: 'bar', bar: 'baz' });

    merge({ class: [] }, {})
      .should.eql({ class: [] });

    merge({ class: [] }, { class: [] })
      .should.eql({ class: [] });

    merge({ class: [] }, { class: ['foo'] })
      .should.eql({ class: ['foo'] });

    merge({ class: ['foo'] }, {})
      .should.eql({ class: ['foo'] });

    merge({ class: ['foo'] }, { class: ['bar'] })
      .should.eql({ class: ['foo','bar'] });

    merge({ class: ['foo', 'raz'] }, { class: ['bar', 'baz'] })
      .should.eql({ class: ['foo', 'raz', 'bar', 'baz'] });

    merge({ class: 'foo' }, { class: 'bar' })
      .should.eql({ class: ['foo', 'bar'] });

    merge({ class: 'foo' }, { class: ['bar', 'baz'] })
      .should.eql({ class: ['foo', 'bar', 'baz'] });

    merge({ class: ['foo', 'bar'] }, { class: 'baz' })
      .should.eql({ class: ['foo', 'bar', 'baz'] });

    merge({ class: ['foo', null, 'bar'] }, { class: [undefined, null, 0, 'baz'] })
      .should.eql({ class: ['foo', 'bar', 0, 'baz'] });
  })
})

describe('DebugItem', function(){
  it('should instantiate objects with lineno and filename properties', function(){
    new DebugItem(42, "/path/to/file")
      .should.eql({ lineno: 42, filename: "/path/to/file" });
  })
})
