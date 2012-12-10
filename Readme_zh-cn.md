# Jade - template engine

 Jade 是一个高性能的模板引擎，它深受[Haml](http://haml-lang.com)影响，它是用javascript实现的,并且可以供[node](http://nodejs.org)使用.

 翻译:[草依山](http://jser.me)

## 特性

  - 客户端支持
  - 代码高可读
  - 灵活的缩进
  - 块展开
  - 混合
  - 静态包含
  - 属性改写
  - 安全，默认代码是转义的
  - 运行时和编译时上下文错误报告 
  - 命令行下编译jade模板
  - html 5 模式 (使用 _!!! 5_ 文档类型)
  - 可选的在内存缓存
  - 合并动态和静态标签类
  - 可以通过 _filters_ 修改树
  - 模板继承
  - 原生支持 [Express JS](http://expressjs.com) 
  - 通过 `each` 枚举对象、数组甚至是不能枚举的对象
  - 块注释
  - 没有前缀的标签
  - AST filters
  - 过滤器
    - :sass [sass.js](http://github.com/visionmedia/sass.js) 必须已经安装
    - :less [less.js](http://github.com/cloudhead/less.js) 必须已经安装
    - :markdown [markdown-js](http://github.com/evilstreak/markdown-js) 或者[node-discount](http://github.com/visionmedia/node-discount) 必须已经安装
    - :cdata
    - :coffeescript [coffee-script](http://jashkenas.github.com/coffee-script/) 必须已经安装
  - [Vim Syntax](https://github.com/digitaltoad/vim-jade)
  - [TextMate Bundle](http://github.com/miksago/jade-tmbundle)
  - [Screencasts](http://tjholowaychuk.com/post/1004255394/jade-screencast-template-engine-for-nodejs)
  - [html2jade](https://github.com/donpark/html2jade) 转换器

## 其它实现

  - [php](http://github.com/everzet/jade.php)
  - [scala](http://scalate.fusesource.org/versions/snapshot/documentation/scaml-reference.html)
  - [ruby](http://github.com/stonean/slim)

## 安装

通过 npm:

    npm install jade

## 浏览器支持

 把jade编译为一个可供浏览器使用的单文件，只需要简单的执行:
 
    $ make jade.js

 如果你已经安装了uglifyjs (`npm install uglify-js`)，你可以执行下面的命令它会生成所有的文件。其实每一个正式版本里都帮你做了这事。 
 
    $ make jade.min.js

 默认情况下，为了方便调试Jade会把模板组织成带有形如 `__.lineno = 3` 的行号的形式。 
 在浏览器里使用的时候，你可以通过传递一个选项`{ compileDebug: false }`来去掉这个。
 下面的模板
  
    p Hello #{name}

  会被翻译成下面的函数：

```js
function anonymous(locals, attrs, escape, rethrow) {
  var buf = [];
  with (locals || {}) {
    var interp;
    buf.push('\n<p>Hello ' + escape((interp = name) == null ? '' : interp) + '\n</p>');
  }
  return buf.join("");
}
```

  通过使用Jade的 `./runtime.js`你可以在浏览器使用这些预编译的模板而不需要使用Jade, 你只需要使用runtime.js里的工具函数, 它们会放在`jade.attrs`, `jade.escape` 这些里。 把选项 `{ client: true }` 传递给 `jade.compile()`, Jade 会把这些帮助函数的引用放在`jade.attrs`, `jade.escape`.

```js
function anonymous(locals, attrs, escape, rethrow) {
  var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
  var buf = [];
  with (locals || {}) {
    var interp;
    buf.push('\n<p>Hello ' + escape((interp = name) == null ? '' : interp) + '\n</p>');
  }
  return buf.join("");
}
```

## 公开API

```javascript
    var jade = require('jade');

    // Compile a function
    var fn = jade.compile('string of jade', options);
    fn(locals);
```

### 选项

 - `self`      使用`self` 命名空间来持有本地变量. _默认为false_
 - `locals`    本地变量对象
 - `filename`  异常发生时使用，includes时必需
 - `debug`     输出token和翻译后的函数体
 - `compiler`  替换掉jade默认的编译器
 - `compileDebug`  `false`的时候调试的结构不会被输出

## 语法 

### 行结束标志

**CRLF** 和 **CR** 会在编译之前被转换为 **LF** 

### 标签

标签就是一个简单的单词:

    html

它会被转换为 `<html></html>`

标签也是可以有id的:

    div#container

它会被转换为 `<div id="container"></div>`

怎么加类呢？

    div.user-details

转换为 `<div class="user-details"></div>`

多个类? 和id? 也是可以搞定的:

    div#foo.bar.baz

转换为 `<div id="foo" class="bar baz"></div>`

不停的div div div 很讨厌啊 , 可以这样:

    #foo
    .bar

这个算是我们的语法糖，它已经被很好的支持了，上面的会输出：

    `<div id="foo"></div><div class="bar"></div>`

### 标签文本 

只需要简单的把内容放在标签之后：

    p wahoo!

它会被渲染为 `<p>wahoo!</p>`.

很帅吧，但是大段的文本怎么办呢：

    p
      | foo bar baz
      | rawr rawr
      | super cool
      | go jade go

渲染为 `<p>foo bar baz rawr.....</p>`

怎么和数据结合起来？ 所有类型的文本展示都可以和数据结合起来，如果我们把`{ name: 'tj', email: 'tj@vision-media.ca' }` 传给编译函数，下面是模板上的写法:

    #user #{name} &lt;#{email}&gt;

它会被渲染为 `<div id="user">tj &lt;tj@vision-media.ca&gt;</div>`

当就是要输出`#{}` 的时候怎么办? 转义一下!

    p \#{something}

它会输出`<p>#{something}</p>`

同样可以使用非转义的变量`!{html}`, 下面的模板将直接输出一个script标签

    - var html = "<script></script>"
    | !{html}

内联标签同样可以使用文本块来包含文本：

    label
      | Username:
      input(name='user[name]')

或者直接使用标签文本:

    label Username:
      input(name='user[name]')

_只_包含文本的标签，比如`script`, `style`, 和 `textarea` 不需要前缀`|` 字符, 比如:

      html
        head
          title Example
          script
            if (foo) {
              bar();
            } else {
              baz();
            }

这里还有一种选择，可以使用'.' 来开始一段文本块，比如：

      p.
        foo asdf
        asdf
         asdfasdfaf
         asdf
        asd.

会被渲染为:

        <p>foo asdf
        asdf
          asdfasdfaf
          asdf
        asd
        .
        </p>

这和带一个空格的 '.' 是不一样的, 带空格的会被Jade的解析器忽略，当作一个普通的文字: 

    p .
    
渲染为:

    <p>.</p>


需要注意的是广西块需要两次转义。比如想要输出下面的文本：

    </p>foo\bar</p>

使用:

    p.
      foo\\bar

### 注释

单行注释和JavaScript里是一样的，通过"//"来开始，并且必须单独一行：

    // just some paragraphs
    p foo
    p bar

渲染为：

    <!-- just some paragraphs -->
    <p>foo</p>
    <p>bar</p>

Jade 同样支持不输出的注释，加一个短横线就行了：

    //- will not output within markup
    p foo
    p bar

渲染为：

    <p>foo</p>
    <p>bar</p>

### 块注释

 块注释也是支持的：

      body
        //
          #content
            h1 Example

渲染为：

    <body>
      <!--
      <div id="content">
        <h1>Example</h1>
      </div>
      -->
    </body>

Jade 同样很好的支持了条件注释：

    body
      //if IE
        a(href='http://www.mozilla.com/en-US/firefox/') Get Firefox


渲染为：
    <body>
      <!--[if IE]>
        <a href="http://www.mozilla.com/en-US/firefox/">Get Firefox</a>
      <![endif]-->
    </body>


### 内联

 Jade 支持以自然的方式定义标签嵌套:

    ul
      li.first
        a(href='#') foo
      li
        a(href='#') bar
      li.last
        a(href='#') baz

### 块展开 

   块展开可以帮助你在一行内创建嵌套的标签，下面的例子和上面的是一样的：

      ul
        li.first: a(href='#') foo
        li: a(href='#') bar
        li.last: a(href='#') baz


### 属性

Jade 现在支持使用'(' 和 ')' 作为属性分隔符

    a(href='/login', title='View login page') Login

当一个值是 `undefined` 或者 `null` 属性_不_会被加上,
所以呢，它不会编译出 'something="null"'.

    div(something=null)

Boolean 属性也是支持的:

    input(type="checkbox", checked)

使用代码的Boolean 属性只有当属性为`true`时才会输出：

    input(type="checkbox", checked=someValue)
    
多行同样也是可用的：

    input(type='checkbox',
      name='agreement',
      checked)

多行的时候可以不加逗号：

    input(type='checkbox'
      name='agreement'
      checked)

加点空格，格式好看一点？同样支持

    input(
      type='checkbox'
      name='agreement'
      checked)

冒号也是支持的:

    rss(xmlns:atom="atom")

假如我有一个`user` 对象 `{ id: 12, name: 'tobi' }`
我们希望创建一个指向"/user/12"的链接 `href`, 我们可以使用普通的javascript字符串连接，如下:

    a(href='/user/' + user.id)= user.name

或者我们使用jade的修改方式,这个我想很多使用Ruby或者 CoffeeScript的人会看起来像普通的js..:

   a(href='/user/#{user.id}')= user.name

`class`属性是一个特殊的属性，你可以直接传递一个数组，比如`bodyClasses = ['user', 'authenticated']` :

    body(class=bodyClasses)

### HTML

 内联的html是可以的，我们可以使用管道定义一段文本 :

```
html
  body
    | <h1>Title</h1>
    | <p>foo bar baz</p>
```

 或者我们可以使用`.` 来告诉Jade我们需要一段文本：

```
html
  body.
    <h1>Title</h1>
    <p>foo bar baz</p>
```

 上面的两个例子都会渲染成相同的结果：

```
<html><body><h1>Title</h1>
<p>foo bar baz</p>
</body></html>
```

 这条规则适应于在jade里的任何文本：

```
html
  body
    h1 User <em>#{name}</em>
```

### Doctypes

添加文档类型只需要简单的使用 `!!!`, 或者 `doctype` 跟上下面的可选项:

    !!!

会渲染出 _transitional_ 文档类型, 或者:

    !!! 5

or

    !!! html

or

    doctype html

doctypes 是大小写不敏感的, 所以下面两个是一样的:

    doctype Basic
    doctype basic

当然也是可以直接传递一段文档类型的文本：

    doctype html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN

渲染后:

    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN>

会输出 _html 5_ 文档类型. 下面的默认的文档类型，可以很简单的扩展：

```javascript
    var doctypes = exports.doctypes = {
	    '5': '<!DOCTYPE html>',
	    'xml': '<?xml version="1.0" encoding="utf-8" ?>',
	    'default': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
	    'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
	    'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
	    'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
	    '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
	    'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
	    'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
	};
```

非常简单的改变默认的：

```javascript
    jade.doctypes.default = 'whatever you want';
```

## 过滤器

过滤器前缀 `:`, 比如 `:markdown` 会把下面块里的文本交给专门的函数进行处理。查看顶部 _特性_ 里有哪些可用的过滤器。

    body
      :markdown
        Woah! jade _and_ markdown, very **cool**
        we can even link to [stuff](http://google.com)

渲染为:

       <body><p>Woah! jade <em>and</em> markdown, very <strong>cool</strong> we can even link to <a href="http://google.com">stuff</a></p></body>

## 代码

Jade目前支持三种类型的可执行代码。第一种是前缀`-`， 这是不会被输出的：

    - var foo = 'bar';

这可以用在条件语句或者循环中：

    - for (var key in obj)
      p= obj[key]

由于Jade的缓存技术，下面的代码也是可以的：

    - if (foo)
      ul
        li yay
        li foo
        li worked
    - else
      p oh no! didnt work

哈哈，甚至是很长的循环也是可以的：

    - if (items.length)
      ul
        - items.forEach(function(item){
          li= item
        - })

所以你想要的！

下一步我们要_转义_输出的代码，比如我们返回一个值，只要前缀一个`=`：   

    - var foo = 'bar'
    = foo
    h1= foo

它会渲染为`bar<h1>bar</h1>`. 为了安全起见，使用`=`输出的代码默认是转义的,如果想直接输出不转义的值可以使用`!=`：

    p!= aVarContainingMoreHTML

Jade 同样是设计师友好的，它可以使javascript更直接更富表现力。比如下面的赋值语句是相等的，同时表达式还是通常的javascript：
 
     - var foo = 'foo ' + 'bar'
     foo = 'foo ' + 'bar'

Jade会把 `if`, `else if`, `else`, `until`, `while`, `unless`同别的优先对待, 但是你得记住它们还是普通的javascript：

     if foo == 'bar'
       ul
         li yay
         li foo
         li worked
     else
       p oh no! didnt work  

## 循环

尽管已经支持JavaScript原生代码，Jade还是支持了一些特殊的标签，它们可以让模板更加易于理解，其中之一就是`each`, 这种形式：

    each VAL[, KEY] in OBJ

一个遍历数组的例子 ：

    - var items = ["one", "two", "three"]
    each item in items
      li= item

渲染为:

    <li>one</li>
    <li>two</li>
    <li>three</li>

遍历一个数组同时带上索引：

    items = ["one", "two", "three"]
    each item, i in items
      li #{item}: #{i}

渲染为:

    <li>one: 0</li>
    <li>two: 1</li>
    <li>three: 2</li>

遍历一个数组的键值：

    obj = { foo: 'bar' }
    each val, key in obj
      li #{key}: #{val}

将会渲染为：`<li>foo: bar</li>`

Jade在内部会把这些语句转换成原生的JavaScript语句，就像使用 `users.forEach(function(user){`,
词法作用域和嵌套会像在普通的JavaScript中一样：

    each user in users
      each role in user.roles
        li= role

如果你喜欢，也可以使用`for` ：
 
    for user in users
      for role in user.roles
        li= role

## 条件语句

Jade 条件语句和使用了(`-`) 前缀的JavaScript语句是一致的,然后它允许你不使用圆括号，这样会看上去对设计师更友好一点，
同时要在心里记住这个表达式渲染出的是_常规_Javascript：

    for user in users
      if user.role == 'admin'
        p #{user.name} is an admin
      else
        p= user.name

和下面的使用了常规JavaScript的代码是相等的：

     for user in users
       - if (user.role == 'admin')
         p #{user.name} is an admin
       - else
         p= user.name

Jade 同时支持`unless`, 这和`if (!(expr))`是等价的：

     for user in users
       unless user.isAnonymous
         p
           | Click to view
           a(href='/users/' + user.id)= user.name 

## 模板继承

  Jade 支持通过 `block` 和 `extends` 关键字来实现模板继承。 一个块就是一个Jade的"block" ，它将在子模板中实现，同时是支持递归的。
  
  Jade 块支持默认内容，blocks can provide default content if desired, however optional as shown below by `block scripts`, `block content`, and `block foot`.

```
html
  head
    h1 My Site - #{title}
    block scripts
      script(src='/jquery.js')
  body
    block content
    block foot
      #footer
        p some footer content
```

  Now to extend the layout, simply create a new file and use the `extends` directive as shown below, giving the path (with or without the .jade extension). You may now define one or more blocks that will override the parent block content, note that here the `foot` block is _not_ redefined and will output "some footer content".

```
extends extend-layout

block scripts
  script(src='/jquery.js')
  script(src='/pets.js')

block content
  h1= title
  each pet in pets
    include pet
```

  It's also possible to override a block to provide additional blocks, as shown in the following example where `content` now exposes a `sidebar` and `primary` block for overriding, or the child template could override `content` all together.

```
extends regular-layout

block content
  .sidebar
    block sidebar
      p nothing
  .primary
    block primary
      p nothing
```

## Includes

 Includes allow you to statically include chunks of Jade,
 or other content like css, or html which lives in separate files. The classical example is including a header and footer. Suppose we have the following directory structure:

     ./layout.jade
     ./includes/
       ./head.jade
       ./tail.jade

and the following _layout.jade_:

      html
        include includes/head  
        body
          h1 My Site
          p Welcome to my super amazing site.
          include includes/foot

both includes _includes/head_ and _includes/foot_ are
read relative to the `filename` option given to _layout.jade_,
which should be an absolute path to this file, however Express does this for you. Include then parses these files, and injects the AST produced to render what you would expect:

```html
<html>
  <head>
    <title>My Site</title>
    <script src="/javascripts/jquery.js">
    </script><script src="/javascripts/app.js"></script>
  </head>
  <body>
    <h1>My Site</h1>
    <p>Welcome to my super lame site.</p>
    <div id="footer">
      <p>Copyright>(c) foobar</p>
    </div>
  </body>
</html>
```

 As mentioned `include` can be used to include other content
 such as html or css. By providing an extension Jade will not
 assume that the file is Jade source and will include it as
 a literal:

```
html
  body
    include content.html
```

  Include directives may also accept a block, in which case the
  the given block will be appended to the _last_ block defined
  in the file. For example if `head.jade` contains:

  
  ```
head
  script(src='/jquery.js')
```

 We may append values by providing a block to `include head`
 as shown below, adding the two scripts.

```
html
  include head
    script(src='/foo.js')
    script(src='/bar.js')
  body
    h1 test
```


## Mixins

 Mixins are converted to regular JavaScript functions in
 the compiled template that Jade constructs. Mixins may
 take arguments, though not required:

      mixin list
        ul
          li foo
          li bar
          li baz

  Utilizing a mixin without args looks similar, just without a block:
  
      h2 Groceries
      mixin list

  Mixins may take one or more arguments as well, the arguments
  are regular javascripts expressions, so for example the following:

      mixin pets(pets)
        ul.pets
          - each pet in pets
            li= pet

      mixin profile(user)
        .user
          h2= user.name
          mixin pets(user.pets)

   Would yield something similar to the following html:

```html
<div class="user">
  <h2>tj</h2>
  <ul class="pets">
    <li>tobi</li>
    <li>loki</li>
    <li>jane</li>
    <li>manny</li>
  </ul>
</div>
```

## 产生输出 

 Suppose we have the following Jade:

```
- var title = 'yay'
h1.title #{title}
p Just an example
```

 When the `compileDebug` option is not explicitly `false`, Jade
 will compile the function instrumented with `__.lineno = n;`, which
 in the event of an exception is passed to `rethrow()` which constructs
 a useful message relative to the initial Jade input.

```js
function anonymous(locals) {
  var __ = { lineno: 1, input: "- var title = 'yay'\nh1.title #{title}\np Just an example", filename: "testing/test.js" };
  var rethrow = jade.rethrow;
  try {
    var attrs = jade.attrs, escape = jade.escape;
    var buf = [];
    with (locals || {}) {
      var interp;
      __.lineno = 1;
       var title = 'yay'
      __.lineno = 2;
      buf.push('<h1');
      buf.push(attrs({ "class": ('title') }));
      buf.push('>');
      buf.push('' + escape((interp = title) == null ? '' : interp) + '');
      buf.push('</h1>');
      __.lineno = 3;
      buf.push('<p>');
      buf.push('Just an example');
      buf.push('</p>');
    }
    return buf.join("");
  } catch (err) {
    rethrow(err, __.input, __.filename, __.lineno);
  }
}
```

When the `compileDebug` option _is_ explicitly `false`, this instrumentation
is stripped, which is very helpful for light-weight client-side templates. Combining Jade's options with the `./runtime.js` file in this repo allows you
to toString() compiled templates and avoid running the entire Jade library on
the client, increasing performance, and decreasing the amount of JavaScript
required.

```js
function anonymous(locals) {
  var attrs = jade.attrs, escape = jade.escape;
  var buf = [];
  with (locals || {}) {
    var interp;
    var title = 'yay'
    buf.push('<h1');
    buf.push(attrs({ "class": ('title') }));
    buf.push('>');
    buf.push('' + escape((interp = title) == null ? '' : interp) + '');
    buf.push('</h1>');
    buf.push('<p>');
    buf.push('Just an example');
    buf.push('</p>');
  }
  return buf.join("");
}
```

##  Makefile的一个例子

  Below is an example Makefile used to compile _pages/*.jade_
  into _pages/*.html_ files by simply executing `make`.
 
```make
JADE = $(shell find pages/*.jade)
HTML = $(JADE:.jade=.html)

all: $(HTML)
	
%.html: %.jade
	jade < $< --path $< > $@

clean:
	rm -f $(HTML)

.PHONY: clean
```

this can be combined with the `watch(1)` command to produce
a watcher-like behaviour:

     $ watch make

## jade(1)

```

使用: jade [options] [dir|file ...]

选项:

  -h, --help         输出帮助信息
  -v, --version      输出版本号
  -o, --obj <str>    javascript选项
  -O, --out <dir>    输出编译后的html到<dir>
  -p, --path <path>  在处理stdio时，查找包含文件时的查找路径

Examples:

  # 编译整个目录
  $ jade templates

  # create {foo,bar}.html
  $ jade {foo,bar}.jade

  # jade over stdio
  $ jade < my.jade > my.html

  # jade over stdio specifying filename to resolve include directives
  $ jade < my.jade -p my.jade > my.html

  # jade over stdio
  $ echo "h1 Jade!" | jade

  # foo, bar dirs rendering to /tmp
  $ jade foo bar --out /tmp 

```

## License 

(The MIT License)

Copyright (c) 2009-2010 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
