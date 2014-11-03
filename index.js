var moment = require('moment');
var yaml = require('js-yaml');
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var trim = require('trimmer');
var Q = require('q');
var delim = "---\n";
var assign = require('object-assign');
var date_formats = ["YYYY-MM-DD", "YYYY-MM-DD-HHmmss"];

var plugin = function (content) {

    return function (pages, next) {

        var read_promises = [];

        var glob_deferred = Q.defer();

        var glob_directory = plugin.content_directory + content;

        glob(glob_directory, {}, function (err, files) {

            files.forEach(function (file, current) {

                var read_deferred = Q.defer();

                read_promises[current] = read_deferred.promise;

                fs.stat(file, function(err, stats){

                    if(stats.isFile()) {

                        var ext = path.extname(file);

                        var parts;

                        var page = {};

                        var category = path.dirname(file);

                        page.slug = path.basename(file, ext);

                        page.category = category.substr(plugin.content_directory.length);

                        if (plugin.converter) {

                            parts = path.basename(file, ext).split('.');

                            if (parts.length >= 2) {

                                page.date = moment(parts[0], date_formats);

                                if (page.date && page.date.isValid()) {

                                    page.slug = parts.slice(1).join('.');
                                }
                            }

                            if (!(page.date && page.date.isValid())) {

                                page.date = moment();
                            }

                            fs.readFile(file, { encoding: 'utf-8' }, function (err, data) {

                                if (err) throw err;

                                data += "\n";

                                data = data.split(delim);

                                if(data.length > 1) {

                                    page = assign(page, yaml.load(data[1]));

                                    data = data.slice(2);
                                }

                                plugin.converter(data.join(delim), function (err, content) {

                                    page.content = content;

                                    pages.push(page);

                                    read_deferred.resolve();
                                });

                            });
                        }
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

                pages.sort(function(a, b) {

                    if(!a.date && !b.date) return 0;

                    if(!a.date) return -1;

                    if(!b.date || a.date < b.date) {

                        return 1;
                    }

                    if(a.date > b.date) {

                        return -1;
                    }

                    return 0;
                });

                next(pages);
            });
        });
    };
};

plugin.content_directory = './content/';

plugin.converter = function (content, cb) {

    return cb(null, content);
};

plugin.configure = function (content_directory, converter) {

    plugin.content_directory = content_directory;

    plugin.converter = converter;
};

module.exports = plugin;
