var glob = require('glob');
var path = require('path');
var fs = require('fs');
var compose = require('static-compose');

function read_file(file) {

    return new Promise(function(resolve, reject){

        fs.stat(file, function(err, stats){

            if (err) {

                reject(err);
            }
            else {

                if(stats.isFile()) {

                    var page = {};

                    fs.readFile(file, { encoding: 'utf-8' }, function (err, data) {

                        if (err) {

                            reject(err);
                        }
                        else {

                            page.content = data;

                            resolve(page);
                        }

                    });
                }
                else {

                    resolve({});
                }
            }
        });
    });
}

module.exports = function(content, converters) {

    return function (pages) {

        if(!content) {

            return Promise.resolve(pages);
        }

        return new Promise(function(resolve, reject){

            glob(content, {}, function (err, files) {

                if(err) {

                    reject(err);
                }
                else {

                    var read_promises = files.map(function (file) {

                        return read_file(file)
                            .then(function(page){

                                page.file = file;

                                return compose(converters)(page);
                            });
                    });

                    Promise.all(read_promises)
                        .then(function (new_pages) {

                            Array.prototype.push.apply(pages, new_pages);

                            resolve(pages);
                        })
                        .catch(function(err){

                            reject(err);
                        });
                }
            });
        });
    };
};
