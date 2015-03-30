var glob = require('glob');
var path = require('path');
var fs = require('fs');

module.exports = function(content) {

    return function (pages, done) {

        glob(content, {}, function (err, files) {

            if(err) {

                done(err);
            }
            else {

                files = files.map(function(file){

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
                });

                Promise.all(files).then(function (newPages) {

                    [].push.apply(pages, newPages);

                    done(null, pages);
                });
            }
        });
    };
};
