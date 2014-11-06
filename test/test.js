var mock = require('mock-fs');
var assert = require('chai').assert;
var Q = require('q');
var rewire = require('rewire');
var content = rewire('../index.js');
var glob = rewire('glob');

var mocked_fs = mock.fs({
    './test/content/': {

    }
});

glob.__set__('fs', mocked_fs);

content.__set__('glob', glob);

content.__set__('fs', mocked_fs);

describe('plugin', function(){

    it('it should append to existing pages', function(done){

        done();
    });

    it('it should call converters in order', function(done){

        done();
    });

    it('it should sort results by date descending', function(done){

        done();
    });

    describe('.configure', function(){

        it('if it\'s not called the content directory and the converter should be the defaults', function(done){

            assert.deepEqual(content.directory, './');

            assert.deepEqual(content.converters, []);

            done();
        });

        it('should set the content directory and the converter', function(done){

            var directory = './test/content/';
            var converters = [function(file, page, next){

                next(file, page);
            }];

            content.configure(directory, converters);

            assert.equal(content.directory, directory);
            assert.equal(content.converters, converters);

            done();
        });
    });
});
