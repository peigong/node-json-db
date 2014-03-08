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

var logger = require('../../logger.js');

var Datastore = require('nedb');

/**
* @param {Object} options 数据库的配置选项。
* 配置项的格式：
* { 'db': '', 'ready': ''}
*/
function NeDBDecorator(options){
    this._collection_prefix = 'collection_';
    this._initialise_(options);
}
NeDBDecorator.prototype = {
    /**
    * 初始化。
    * @param {Object} options 数据库选项配置。
    */
    _initialise_: function(options){
        var db = path.normalize(path.resolve(options.db, 'db'));
        var ready = options['ready'] || function(err){ logger.error(err); };
        this._loadingCollections_(db, ready);
    },
    _loadingCollections_: function(db, ready){
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
                if (!that.hasOwnProperty(collection)) {
                    that[that._collection_prefix + collection] = new Datastore();
                }
                var collection_path = path.join(db, collections[i]);
                tasks[collection] = createTask(collection_path);
            }
            async.parallel(tasks, function(err, results){
                if (err) { logger.error(err); }
                for(var collection in results){
                    var files = results[collection];
                    for (var i = 0; i < files.length; i++) {
                        var filename = path.join(db, collection, files[i]);
                        var content = fs.readFileSync(filename);
                        var doc = JSON.parse(content.toString());
                        doc['_id'] = files[i];
                        that[that._collection_prefix + collection].insert(doc);
                    }
                }
                ready(null);
            });
        });
    },
    _createLoadCollectionTask_: function(collection){
        return function(callback){
            fs.readdir(collection, callback);
        };
    }
};

module.exports = NeDBDecorator;
