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

function NeDBDecorator(options){
    this.options = options;
    this.db = options['db'];
    this.dbo = new Datastore();
    this.initialise(options);
}
NeDBDecorator.prototype = {
    /**
    * 初始化。
    * @param {Object} options 数据库选项配置。
    */
    initialise: function(options){
        var db = path.normalize(path.resolve(this.db, 'db'));
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
            var db = results['db'];
            var collections = results['collections'];
            var tasks = {};
            for (var i = 0; i < collections.length; i++) {
                var collection = path.join(db, collections[i]);
                tasks[collections[i]] = that.createLoadCollectionTask(collection);
            }
            async.parallel(tasks, function(err, results){
                if (err) { logger.error(err); }
                for(var collection in results){
                    logger.trace(collection);
                    for (var i = 0; i < results[collection].length; i++) {
                        logger.trace(results[collection][i]);
                        var doc = fs.existsSync(results[collection][i]);
                        logger.trace(doc);
                    }
                }
                ready();
            });
        });
    },
    createLoadCollectionTask: function(collection){
        return function(callback){
            fs.readdir(collection, function(err, files){
                var result = [];
                for (var i = 0; i < files.length; i++) {
                    result.push(path.join(collection, files[i]));
                }
                callback(null, result);
            });
        };
    }
};

module.exports = NeDBDecorator;
