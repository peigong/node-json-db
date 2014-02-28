# njdb [![Build Status](https://secure.travis-ci.org/toolkit-rack/node-json-db.png?branch=master)](http://travis-ci.org/toolkit-rack/node-json-db)

# Node JSON Database #

Node实现的JSON数据库，API是MongoDB的子集。

## 新手上路

> 试验阶段，不发布为NPM包，也不发布为Bower包。暂时使用内部Bower的方式使用。

在命令行中，使用`npm install njdb`命令安装模块。

	var njdb = require('njdb');
	var db = new njdb.NodeJsonDB();

## 文档

## 设计需求 ##

1. API是MongoDB的子集。
2. 存储方式为数据库是一个目录，集合为子目录，文档是集合目录下JSON格式的文件。

## 设计方案 ##

当前采用组合装饰[NeDB (Node embedded database)](https://github.com/louischatriot/nedb)的方式实现。

## 范例

## 版本历史

1. 0.1.0：实现基本的数据库查询功能。

## 许可

Copyright (c) 2014 周培公  
Licensed under the MIT license.
