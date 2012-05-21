
var runtime = require('../lib/runtime')
  , merge = runtime.merge;

describe('merge(a, b, escaped)', function(){
  it('should merge classes into strings', function(){
    merge({ foo: 'bar' }, { bar: 'baz' })
      .should.eql({ foo: 'bar', bar: 'baz' });

    merge({ class: [] }, {})
      .should.eql({ class: [] }); // broken

    merge({ class: [] }, { class: [] })
      .should.eql({ class: ' ' }); // ok but broken

    merge({ class: [] }, { class: ['foo'] })
      .should.eql({ class: ' foo' });

    merge({ class: ['foo'] }, {})
      .should.eql({ class: ['foo'] }); // broken

    merge({ class: ['foo'] }, { class: ['bar'] })
      .should.eql({ class: 'foo bar' });

    merge({ class: ['foo', 'raz'] }, { class: ['bar', 'baz'] })
      .should.eql({ class: 'foo,raz bar baz' }); // broken

    merge({ class: 'foo' }, { class: 'bar' })
      .should.eql({ class: 'foo bar' });

    merge({ class: 'foo' }, { class: 'bar' })
      .should.eql({ class: 'foo bar' });

    merge({ class: 'foo' }, { class: ['bar', 'baz'] })
      .should.eql({ class: 'foo bar baz' });

    merge({ class: ['foo', 'bar'] }, { class: 'baz' })
      .should.eql({ class: 'foo,bar baz' }); // broken

    merge({ class: ['foo', null, 'bar'] }, { class: [undefined, null, 1, 'baz'] })
      .should.eql({ class: 'foo,,bar   1 baz' }); // broken
  })
})