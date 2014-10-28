//@include ../bower_components/es6-promise/promise.js
//@include ../bower_components/fetch/fetch.js

(function(exports) {
    //@include ./definitions.js

    var
        Qi = {}, //public object
        _ = {}; //protexted object

    //@include ./util.js
    //@include ./authorize.js
    //@include ./fetch.js
    //@include ./user.js
    //@include ./item.js
    //@include ./comment.js

    exports.Qi = Qi;

}(this));