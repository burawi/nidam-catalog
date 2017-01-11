var express = require('express');
var router = express.Router();
var adminRouter = express.Router();
var tayrPassport = require('tayr-passport');

module.exports = function(G,mdl) {

    var T = G[mdl.conf.tayrProp];
    var table = mdl.conf.table;

    adminRouter.get('/', function(req, res, next) {
        mdl.F.list().then(function (list) {
            G.nidam.render(req, res, mdl.V.P.page, {mdl: mdl});
        });
    });

    adminRouter.post('/list', function(req, res, next) {
        mdl.F.list().then(function (list) {
            res.json({success: true, msg: list});
        });
    });

    adminRouter.post('/add',
        mdl.F.verify,
        mdl.F.filterFiles,
        function(req, res, next) {
            mdl.F.add(req).then(function (item) {
                res.json({success: true, msg: item});
            });
        }
    );

    adminRouter.post('/add-files',
        mdl.F.filterFiles,
        function(req, res, next) {
            mdl.F.addFiles(req).then(function (item) {
                res.json({success: true, msg: item});
            });
        }
    );

    adminRouter.post('/edit',
        mdl.F.verify,
        function(req, res, next) {
            mdl.F.edit(req).then(function (item) {
                res.json({success: true, msg: item});
            });
        }
    );

    adminRouter.post('/replace-files',
        mdl.F.filterFiles,
        function(req, res, next) {
            mdl.F.replaceFiles(req).then(function (item) {
                res.json({success: true, msg: item});
            });
        }
    );

    adminRouter.post('/delete', function(req, res, next) {
        mdl.F.delete(req).then(function (deleted) {
            res.json({success: true});
        });
    });

    adminRouter.post('/delete-files',
        mdl.F.filterFiles,
        function(req, res, next) {
            mdl.F.deleteFiles(req).then(function (item) {
                res.json({success: true, msg: item});
            });
        }
    );

    G.app.use('/' + mdl.conf. prefix, router);
    G.app.use('/admin/' + mdl.conf. prefix, adminRouter);
};
