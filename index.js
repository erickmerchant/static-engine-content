var glob = require('glob');
var path = require('path');
var fs = require('fs');

module.exports = function(content) {

    return function (pages) {

        if(!content) {

            return Promise.resolve(pages);
        }

        return (new Promise(function(resolve, reject){

            glob(content, {}, function (err, files) {

                if(err) {

                    reject(err);
                }
                else {

                    resolve(files);
                }
            });
        }))
        .then(function(files){

            return Promise.all(files.map(function(file){

                return new Promise(function(resolve, reject){

                    var page = {};

                    fs.readFile(file, { encoding: 'utf-8' }, function (err, data) {

                        if (err) {

                            reject(err);
                        }
                        else {

                            page.file = file;

                            page.content = data;

                            resolve(page);
                        }

                    });
                });
            }));
        })
        .then(function (newPages) {

            [].push.apply(pages, newPages);

            return Promise.resolve(pages);
        });
    };
};
