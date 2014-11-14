(function (global) {
    var HOST = 'https://qiita.com',
        Qi = {};

    //@include core.js
    //@include response.js
    //@include iterator.js

    //@include item.js
    //@include comment.js
    //@include user.js
    //@include tag.js

    global.Qi = Qi;
}(this));

var CLIENT_ID = 'c4139214b24f2d599e6d302cf380ab783f41483a',
    CLIENT_SECRET = '11eb18233e0eb8b57868c82fed4fca580da984b1';

Qi.init({
    token: '82f40809d9c81666836a1694c4a2f3605f18f129',
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET
});