var glob = require('glob');
var path = require('path');
var fs = require('fs');
var Promise = require('es6-promise').Promise;

function run_converters(page, converters) {

    var i = -1;

    return new Promise(function(resolve, reject){

        var next = function(page) {

            if (++i < converters.length) {

                converters[i](page).then(next);

                return;
            }

            resolve(page);
        };

        next(page);
    });
}

function read_file(file) {

    return new Promise(function(resolve, reject){

        fs.stat(file, function(err, stats){

            if(stats.isFile()) {

                var page = {};

                fs.readFile(file, { encoding: 'utf-8' }, function (err, data) {

                    if (err) throw err;

                    page.content = data;

                    file = file.substr(plugin.directory.length);

                    resolve(page);

                });
            }
            else {

                resolve({});
            }
        });
    });
}

function plugin(content) {

    return function (pages) {

        if(!content) {

            return Promise.resolve(pages);
        }

        var glob_directory = plugin.directory + content;

        return new Promise(function(resolve, reject){

            glob(glob_directory, {}, function (err, files) {

                var read_promises = files.map(function (file) {

                    return read_file(file)
                        .then(function(page){

                            page.file = file;

                            return run_converters(page, plugin.converters);
                        });
                });

                Promise.all(read_promises).then(function (new_pages) {

                    Array.prototype.push.apply(pages, new_pages)

                    resolve(pages);
                });
            });
        });
    };
}

plugin.directory = './';

plugin.converters = [];

plugin.configure = function(directory, converters) {

    plugin.directory = directory;

    plugin.converters = converters;
};

module.exports = plugin;
