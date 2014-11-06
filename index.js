var moment = require('moment');
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var Q = require('q');

function run_converters(file, page, converters) {

    var i = -1;

    var run_deferred = Q.defer();

    function next(file, page) {

        if (++i < converters.length) {

            converters[i](file, page, next);

            return;
        }

        run_deferred.resolve(page);
    };

    next(file, page);

    return run_deferred.promise;
};

var plugin = function (content) {

    return function (pages, next) {

        if(!content) {

            next(pages);

            return;
        }

        var read_promises = [];

        var glob_deferred = Q.defer();

        var glob_directory = plugin.directory + content;

        glob(glob_directory, {}, function (err, files) {

            files.forEach(function (file, current) {

                var read_deferred = Q.defer();

                read_promises[current] = read_deferred.promise;

                fs.stat(file, function(err, stats){

                    if(stats.isFile()) {

                        var page = {};

                        fs.readFile(file, { encoding: 'utf-8' }, function (err, data) {

                            if (err) throw err;

                            page.content = data;

                            file = file.substr(plugin.directory.length);

                            run_converters(file, page, plugin.converters).then(function(page){

                                pages.push(page);

                                read_deferred.resolve();
                            });

                        });
                    }
                    else {

                        read_deferred.resolve();
                    }
                });

            });

            glob_deferred.resolve();

        });

        Q.when(glob_deferred.promise).then(function () {

            Q.all(read_promises).then(function () {

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
