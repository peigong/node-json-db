/*
 * njdb
 * https://github.com/toolkit-rack/node-json-db
 *
 * Copyright (c) 2014 周培公
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');
var mkdirp = require('mkdirp');
var util = require('util');

var logger = require('../../logger.js');

var Datastore = require('nedb');

/**
* @param {Object} options 数据库的配置选项。
* 配置项的格式：
* { 'db': '', 'ready': ''}
*/
function NeDBDecorator(options){
    this.collection_prefix = 'collection_';
    this.initialise(options);
}
NeDBDecorator.prototype = {
    /**
    * 初始化。
    * @param {Object} options 数据库选项配置。
    */
    initialise: function(options){
        var db = path.normalize(path.resolve(options.db, 'db'));
        var ready = options['ready'] || function(err){ logger.error(err); };
        this.loadingCollections(db, ready);
    },
    loadingCollections: function(db, ready){
        var that = this;
        async.series({
            db: function(callback){
                mkdirp(db, function(err){ callback(err, db); });
            },
            collections: function(callback){
                fs.readdir(db, callback);
            }
        },
        function(err, results) {
            if (err) { logger.error(err); }
            /*数据库的存储目录*/
            var db = results['db'];
            /*集合名称的列表*/
            var collections = results['collections'];

            var tasks = {};
            function createTask(collection){
                return function(callback){
                    fs.readdir(collection, callback);
                };
            }
            for (var i = 0; i < collections.length; i++) {
                var collection = collections[i];
                var collection_path = path.join(db, collections[i]);
                if (!that.hasOwnProperty(collection)) {
                    var db_name = that.collection_prefix + collection;
                    that[db_name] = new Datastore();
                    that[db_name]['collection_path'] = collection_path;
                }
                tasks[collection] = createTask(collection_path);
            }
            async.parallel(tasks, function(err, results){
                if (err) { logger.error(err); }
                for(var collection in results){
                    var files = results[collection];
                    var db_name = that.collection_prefix + collection;
                    for (var i = 0; i < files.length; i++) {
                        if ('.json' === path.extname(files[i]).toLowerCase()) {
                            var filename = path.join(db, collection, files[i]);
                            var content = fs.readFileSync(filename);
                            var doc = JSON.parse(content.toString());
                            doc['_filename'] = files[i];
                            that[db_name].insert(doc);
                        }
                    }
                    that.reform(that[db_name]);
                }
                ready(null);
            });
        });
    },

    /**
    * 加工改造原有的方法。
    * @param {Datastore} db NeDB数据库。
    */
    reform: function(db){
        var insert = db.insert;
        function inser(doc, cb){
            var callback = cb || function () {};
            var collection_path = db.collection_path;
            insert.call(db, doc, function(err, newDoc){
                var docs = util.isArray(newDoc) ? newDoc : [newDoc];
                for(var i = 0; i < docs.length; i++){
                    var doc = docs[i];
                    var filename = doc['_filename'] || (docs[i]['_id'] + '.json');
                    filename = path.join(collection_path, filename);
                    fs.writeFileSync(filename, JSON.stringify(doc));
                }
                callback(err, newDoc);
            });
        }
        db.insert = inser.bind(db);
    }
};

module.exports = NeDBDecorator;
