/*
 * njdb
 * https://github.com/toolkit-rack/node-json-db
 *
 * Copyright (c) 2014 周培公
 * Licensed under the MIT license.
 */

'use strict';

var _   = require('lodash');

var NodeJsonDB = require('./njdb.js');
//var logger = require('./logger.js');

/**
* 数据库实例。
*/
var database = null;
var database_path = null;

/**
* 数据库加载完毕后，需要执行的回调函数列表。
*/
var tasks = [];

/**
* 数据库的准备状态。
*/
var ReadyState = {
    /**
    * 还没有初始化。
    */
    Uninitialized: 0,

    /**
    * 数据库正在加载中。。。
    */
    Loading: 1,

    /**
    * 数据库加载完毕。
    */
    Loaded: 2
};

var readyState = ReadyState.Uninitialized;

function set(db){
    database_path = db;
}

function exec(task){
    if (database) {//数据库已经加载完毕
        task(database);
    }else if(ReadyState.Loading === readyState){//数据库正在加载中
        tasks.push(task);
    }else{
        tasks.push(task);
        readyState = ReadyState.Loading;
        if (database_path) {
            new NodeJsonDB({ db: database_path, ready: function(err, db){
                database = db;
                readyState = ReadyState.Loaded;
                for (var i = 0; i < tasks.length; i++) {
                    tasks[i](db);
                }
            }});
        }
    }
}

function find(collection, conditions, fields, options, callback){
    if (_.isFunction(fields)) {
        callback = fields;
        fields = false;
        options = {};
    }
    if (_.isFunction(options)) {
        callback = options;
        options = {};
    }
    exec(function(db){
        var query = db[collection].find(conditions);
        if (options && options.hasOwnProperty('limit')) {
            query.limit(options['limit'] * 1);
        }
        query.exec(function(err, docs){
            var newDocs = [];
            for (var i = 0; i < docs.length; i++) {
                var doc = docs[i];
                var newDoc = {};
                if (fields) {
                    for(var key in doc){
                        if (fields.hasOwnProperty(key) && fields[key]) {
                            newDoc[key] = doc[key];
                        }
                    }                    
                }else{
                    newDoc = doc;
                }
                newDocs.push(newDoc);
            }
            callback(err, newDocs);
        });
    });
}

function findOne(collection, conditions, fields, options, callback){
    if (_.isFunction(fields)) {
        callback = fields;
        fields = false;
        options = {};
    }
    if (_.isFunction(options)) {
        callback = options;
        options = {};
    }
    exec(function(db){
        db[collection].findOne(conditions, function(err, doc){
            var newDoc = {};
            if (fields) {
                for(var key in doc){
                    if (fields.hasOwnProperty(key) && fields[key]) {
                        newDoc[key] = doc[key];
                    }
                }
            }else{
                newDoc = doc;
            }
            callback(err, newDoc);
        });
    });
}

function insert(collection, doc, callback){
    exec(function(db){
        db[collection].insert(doc, callback);
    });
}

module.exports = {
    set: set,
    find: find,
    findOne: findOne,
    insert: insert
};