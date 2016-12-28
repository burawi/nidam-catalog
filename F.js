var randomstring = require("randomstring");
var pick = require('js-object-pick');
var md5 = require('md5');
var valod = require('valod');
var fs = require('fs');
var echasync = require('echasync');

module.exports = function (G,conf) {


    var T = G.E[conf.tayrProp];
    var table = conf.table;
    var tableProps = conf.tableProps;
    var filesRelativity = (conf.multiFiles) ? 'cousins' : 'parents';
    var tayrUpload = require('tayr-upload')(G.app, T);

    var exports = {
        verify: function (req, res, next) {
            var validation = new valod(conf.norms);
            var check = validation.check(req.body);
            if(check.valid){
                next();
            }else {
                res.json({success: false, msg: check.errors.join('\n'), code: 'FORMERR'});
            }
        },
        list: function () {
            return new Promise(function(resolve, reject) {
                var more = {};
                more[filesRelativity] = conf.uploadSets.tableName;
                T.find(table,'',null,more).then(function (list) {
                    resolve(list);
                });
            });
        },
        add: function (req) {
            return new Promise(function(resolve, reject) {
                tayrUpload.upload(req,conf.uploadSets).then(function (files) {
                    req.body.price = parseFloat(req.body.price);
                    var item = new T.tayr(table,pick(req.body,tableProps));
                    item.store().then(function () {
                        exports.addFilesTo(item, files).then(function (item) {
                            resolve(item);
                        });
                    });
                });
            });
        },
        edit: function (req) {
            return new Promise(function(resolve, reject) {
                req.body.price = parseFloat(req.body.price);
                var item = new T.tayr(table,pick(req.body,tableProps));
                item.id = req.body.id;
                item.store().then(function () {
                    resolve(item);
                });
            });
        },
        delete: function (req) {
            return new Promise(function(resolve, reject) {
                var item = new T.tayr(table,{
                    id: req.body.id
                });
                item.delete().then(function () {
                    resolve(true);
                });
            });
        },
        getFiles: function (item) {
            return new Promise(function(resolve, reject) {
                var fns = {
                    parents: 'getParent',
                    cousins: 'getCousins'
                };
                item[fns[filesRelativity]](conf.uploadSets.tableName).then(function (files) {
                    resolve(files);
                });
            });
        },
        addFilesTo: function (item, files) {
            return new Promise(function(resolve, reject) {
                if(filesRelativity == 'parents'){
                    item.setParent(files[0]).then(function () {
                        item[conf.uploadSets.tableName] = files[0];
                        resolve(item, files);
                    });
                } else {
                    item.setCousins(conf.uploadSets.tableName, files).then(function () {
                        item[conf.uploadSets.tableName] = files;
                        resolve(item, files);
                    });
                }
            });
        },
        addFiles: function (req) {
            return new Promise(function(resolve, reject) {
                tayrUpload.upload(req,conf.uploadSets).then(function (files) {
                    T.load(table,parseInt(req.body.id)).then(function (item) {
                        exports.addFilesTo(item, files).then(function (item) {
                            resolve(item);
                        });
                    });
                });
            });
        },
        deleteFiles: function (req) {
            return new Promise(function(resolve, reject) {
                T.load(table,parseInt(req.body.id)).then(function (item) {
                    exports.deleteFilesOf(item).then(function (item) {
                        resolve(item);
                    });
                });
            });
        },
        removeRelation: function (item, file) {
            return new Promise(function(resolve, reject) {
                if(conf.multiFiles){
                    item.removeCousin(file).then(function () {
                        resolve();
                    });
                } else {
                    item.fileId = null;
                    resolve(item);
                }
            });
        },
        deleteFilesOf: function (item) {
            return new Promise(function(resolve, reject) {
                exports.getFiles(item).then(function (files) {
                    if(!Array.isArray(files)){
                        files = [files];
                    }
                    echasync.do(files, function (next,file) {
                        fs.unlinkSync(file.path);
                        exports.removeRelation(item, file).then(function (updatedItem) {
                            item = updatedItem;
                            file.delete().then(function () {
                                next();
                            });
                        });
                    }, function () {
                        resolve(item);
                    });
                });
            });
        },
        replaceFilesOf: function (item, newFiles) {
            return new Promise(function(resolve, reject) {
                exports.deleteFilesOf(item).then(function (response) {
                    exports.addFilesTo(item, newFiles).then(function (item) {
                        resolve(item);
                    });
                });
            });
        },
        replaceFiles: function (req) {
            return new Promise(function(resolve, reject) {
                T.load(table,parseInt(req.body.id)).then(function (item) {
                    tayrUpload.upload(req,conf.uploadSets).then(function (newFiles) {
                        exports.replaceFilesOf(item, newFiles).then(function (item) {
                            resolve(item);
                        });
                    });
                });
            });
        },
    };

    return exports;
};
