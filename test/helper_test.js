'use strict';

var fs = require('fs');
var path = require('path');

var helper = require('../lib/helper.js');
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

exports['helper'] = {
  setUp: function(done) {
    helper.set(database);
    done();
  },
  find: function(test) {
    test.expect(1);
    helper.find('books', {}, function(err, docs){
      test.ok((2 === docs.length), '验证是否已经有2条测试数据。');
      test.done();
    });
  },

  findOne: function(test) {
    test.expect(1);
    helper.findOne('books', {"name": "node.js"}, function(err, doc){
      test.equal(doc.pages, '3333', '验证检索出正确的记录');
      test.done();
    });
  },

  insert: function(test){
    test.expect(3);
    var doc = {
      "name": "test-insert-helper",
      "date": new Date()
    };
    var test_collection = 'test';
    helper.insert(test_collection, doc, function(err, newDoc){
      test.ok(newDoc.hasOwnProperty('_id'), '测试返回的新插入对象是否包含_id属性。');
      test.equal(newDoc.date, doc.date, '测试返回的新插入对象属性值是否正确。');
      var doc_path = path.join(database, 'db', test_collection, newDoc['_id'] + '.json');
      fs.exists(doc_path, function(exists){
        test.ok(exists, '验证文档存储成功。');
        test.done();
      });
    });
  }
};
