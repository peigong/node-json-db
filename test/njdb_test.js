'use strict';

var fs = require('fs');
var path = require('path');

var njdb = require('../lib/njdb.js');
var logger = require('../lib/logger.js');

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

exports['database'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'initialise': function(test) {
    test.expect(2);
    var database = path.normalize(path.resolve(__dirname, 'fixtures', 'db_test'));
    var db = new njdb.NodeJsonDB({ 'db': database, 'ready': function(err){
      if(err){ logger.error(err); }
      test.equal(db.db.db, database, '验证数据库初始化后的装饰者对象的数据库目录定义。');
      var db_path = path.join(database, 'db');
      test.ok(fs.existsSync(db_path), '验证数据库存储目录是否创建成功。');
      test.done();
    }});
  }
};
