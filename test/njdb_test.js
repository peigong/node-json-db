'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');

var njdb = require('../lib/njdb.js');
//var logger = require('../lib/logger.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var database = path.normalize(path.resolve(__dirname, 'fixtures', 'db_test'));

exports['database'] = {
  setUp: function(done) {
    done();
  },
  initialise: function(test) {
    test.expect(7);
    function test_callback(err, db){
      async.parallel([
        function(callback){
          var db_path = path.join(database, 'db');
          test.ok(fs.existsSync(db_path), '验证数据库存储目录是否创建成功。');
          var existsCollection = db.hasOwnProperty('books') && db.hasOwnProperty('projects');
          test.ok(existsCollection, '验证数据库初始化后是否具备与集合目录同名的集合存在。');
          callback(null);
        },
        function(callback){
          db.books.find({}, function(err, docs){
            test.ok((2 === docs.length), '验证是否已经有2条测试数据。');
            callback(null);
          });
        },
        function(callback){
          db.books.find({"name": "node.js"}, function(err, docs){
            test.ok((1 === docs.length), '验证是否指定的1条测试数据。');
            test.equal(docs[0].pages, '3333', '验证检索出正确的记录');
            callback(null);
          });
        },
        function(callback){
          db.books.find({}).sort({ pages: 1 }).limit(1).exec(function(err, docs){
            test.equal(docs[0].name, 'mongodb guide', '验证升序排列的第1条测试数据。');
            callback(null);
          });
        },
        function(callback){
          db.books.find({}).sort({ pages: -1 }).limit(1).exec(function(err, docs){
            test.equal(docs[0].name, 'node.js', '验证降序排列的第1条测试数据。');
            callback(null);
          });
        }
      ], function(){
        test.done();
      });
    }

    new njdb.NodeJsonDB({ db: database, ready: test_callback });
  },

  insert: function(test){
    test.expect(4);
    function test_callback(err, db){
      var docs = [
        {
          "name": "test-insert-1",
          "date": new Date()
        },
        {
          "name": "test-insert-2",
          "date": new Date()
        }
      ];
      var test_collection = 'test';
      async.parallel([
        function(callback){
          db[test_collection].insert(docs[0], function(err, newDoc){
            test.ok(newDoc.hasOwnProperty('_id'), '测试返回的新插入对象是否包含_id属性。');
            test.equal(newDoc.date, docs[0].date, '测试返回的新插入对象属性值是否正确。');
            var doc_path = path.join(database, 'db', test_collection, newDoc['_id'] + '.json');
            fs.exists(doc_path, function(exists){
              test.ok(exists, '验证文档存储成功。');
              callback(null);
            });
          });
        },
        function(callback){
          db[test_collection].insert(docs, function(err, newDocs){
            test.ok(newDocs.length, 2, '验证添加成功了2个文档。');
            callback(null);
          });
        }
      ], function(){
        test.done();
      });
    }
    new njdb.NodeJsonDB({ db: database, ready: test_callback });
  }
};
