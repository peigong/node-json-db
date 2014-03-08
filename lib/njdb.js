/*
 * njdb
 * https://github.com/toolkit-rack/node-json-db
 *
 * Copyright (c) 2014 周培公
 * Licensed under the MIT license.
 */

'use strict';

var _   = require('lodash');
var path  = require('path');

var logger = require('./logger.js');
var NeDBDecorator = require('./strategies/nedb/decorator.js');

/**
* @param {Object} options 数据库的配置选项。
* 配置项的格式：
* { 'db': '', 'ready': ''}
*/
function NodeJsonDB(options){
    this._db_ = null;
    this._collection_prefix = 'collection_';
    this._initialise_(options);
}
NodeJsonDB.prototype = {
    /**
    * 初始化。
    * @param {Object} options 数据库选项配置。
    */
    _initialise_: function(options){
        var that = this;
        var _options_ = _.merge({
            /**
            * 数据库的定义目录。
            */
            'db': path.normalize(path.resolve(__dirname, '..', 'db'))
        }, options);

        var _ready = _options_['ready'] || function(err){ logger.error(err); };
        _options_['ready'] = function(err){
            if (!err && !!that._db_) {
                for(var key in that._db_){
                    var prefix = that._collection_prefix;
                    var idx = key.indexOf(prefix);
                    if (idx > -1) {
                        var collection = key.substring(prefix.length);
                        that[collection] = that._db_[key];
                    }
                }
            }
            _ready(err, that);
        };

        if (_options_['db']) {
            this._db_ = new NeDBDecorator(_options_);
        }else{
            var err = 'options no exisits db item!';
            logger.error(err);
            _ready(err);
        }
    }
};
module.exports = { 
    NodeJsonDB: NodeJsonDB
};
