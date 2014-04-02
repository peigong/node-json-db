# njdb [![Build Status](https://secure.travis-ci.org/toolkit-rack/node-json-db.png?branch=master)](http://travis-ci.org/toolkit-rack/node-json-db)

# Node JSON Database #

Node实现的JSON数据库，API是MongoDB的子集。数据库的存储方式是一个目录，集合为其子目录，集合目录下JSON格式的文件作为数据文档。采用组合和装饰的模式对[NeDB (Node embedded database)](https://github.com/louischatriot/nedb)进行包装。

## 安装和使用

### 安装 ###

NPM模块名是njdb。
	
	npm install njdb --save   // Put latest version in your package.json
	npm test   // You'll need the dev dependencies to test it

### 使用 ###

	var njdb = require('njdb');
	var options = { db: database, ready: test_callback };
    new njdb.NodeJsonDB(options);

**必备的配置选项**

1. db：数据库的存储目录。
2. ready：数据库加载完毕后执行的回调函数`function(err, db){}`。第1个参数是错误对象，第2个参数是加载成功后的数据库对象。

## API

当前的API包装实现了[NeDB (Node embedded database)](https://github.com/louischatriot/nedb)项目README.md文档的`Finding documents`和`Inserting documents`部分。

NeDB是单集合数据库，文档中的`db.find()`对应NjDB的`db.collection.find()`。

检索`books`集合全部文档的回调函数，示例如下：

	function(err, db){
		db.books.find({}, function(err, docs){
		});
	}

参见：[doc/nedb/README.md](./doc/nedb/README.md)

## 版本历史

1. 0.1.0：实现基本的数据库查询功能。
2. 0.1.1：增加了Insert实现。
3. 0.1.2：增加了Helper工具和findOne实现。

## 许可

Copyright (c) 2014 周培公  
Licensed under the MIT license.
