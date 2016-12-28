var randomstring = require("randomstring");

module.exports = function (G) {

    var exports = {
        tayrProp: 'T',
        table: 'catalog',
        tableProps: [
            'name',
            'description',
            'price'
        ],
        multiFiles: false,
        uploadSets: {
            fields: ['picture'],
            types: ['jpg','png'],
            dist: './public/uploads',
            maxSize: '2Mb',
            together: false,
            tableName: 'file',
        },
        msg: {
            name: 'name',
            add: 'add',
            edit: 'edit',
            delete: 'delete',
            nameNotValid: 'Name should be Alphanumeric!',
            priceNotValid: 'Price should be Numeric!',
        },
    };

    exports.norms = {
        name: [['required'], exports.msg.nameNotValid],
        price: [['required','numeric'], exports.msg.priceNotValid]
    };

    return exports;
};
