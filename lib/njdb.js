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

function NodeJsonDB(options){
    this.options = {};
    this.db = null;
    this.initialise(options);
}
NodeJsonDB.prototype = {
    /**
    * 初始化。
    * @param {Object} options 数据库选项配置。
    */
    initialise: function(options){
        this.options = _.merge({
            /**
            * 数据库的定义目录。
            */
            'db': path.normalize(path.resolve(__dirname, '..', 'db')),
            'ready': function(err){ logger.error(err); }
        }, options);

        if (this.options['db']) {
            this.db = new NeDBDecorator(this.options);
        }
    }
};
module.exports = { 
    NodeJsonDB: NodeJsonDB
};
