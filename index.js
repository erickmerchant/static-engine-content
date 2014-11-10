var moment = require('moment');
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var Promise = require('es6-promise').Promise;

function run_converters(file, page, converters) {

    var i = -1;

    return new Promise(function(resolve, reject){

        function next(file, page) {

            if (++i < converters.length) {

                converters[i](file, page, next);

                return;
            }

            resolve(page);
        };

        next(file, page);
    });
};

var plugin = function (content) {

    return function (pages, next) {

        if(!content) {

            next(pages);

            return;
        }

        var read_promises = [];

        new Promise(function(resolve, reject){

            var glob_directory = plugin.directory + content;

            glob(glob_directory, {}, function (err, files) {

                read_promises = files.map(function (file, current) {

                    return new Promise(function(resolve, reject){

                        fs.stat(file, function(err, stats){

                            if(stats.isFile()) {

                                var page = {};

                                fs.readFile(file, { encoding: 'utf-8' }, function (err, data) {

                                    if (err) throw err;

                                    page.content = data;

                                    file = file.substr(plugin.directory.length);

                                    run_converters(file, page, plugin.converters).then(function(page){

                                        pages.push(page);

                                        resolve();
                                    });

                                });
                            }
                            else {

                                resolve();
                            }
                        });
                    });
                });

                resolve();

            });
        })
        .then(function () {

            Promise.all(read_promises).then(function () {

                var now = moment();

                pages.sort(function(a, b) {

                    a = a.date || now;

                    b = b.date || now;

                    return b.diff(a);
                });

                next(pages);
            });
        });
    };
};

plugin.directory = './';

plugin.converters = [];

plugin.configure = function(directory, converters) {

    plugin.directory = directory;

    plugin.converters = converters;
};

module.exports = plugin;
