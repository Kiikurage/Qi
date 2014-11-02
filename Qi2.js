(function(global) {
    var HOST = 'https://qiita.com',
        _ = {};
_.get = function(url, param, headers) {
    if (param) {
        url += '?' + encodeURIParam(param);
    }
    return ajax('GET', url, headers, null)

};

_.post = function(url, param, headers) {
    return ajax('POST', url, extend({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }, headers), JSON.stringify(param))
};

_.put = function(url, param, headers) {
    return ajax('PUT', url, extend({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }, headers), JSON.stringify(param))
};

_.patch = function(url, param, headers) {
    return ajax('PATCH', url, extend({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }, headers), JSON.stringify(param))
};

_.delete = function(url, param, headers) {
    return ajax('DELETE', url, headers, null)
};

function ajax(method, url, headers, body) {
    var xhr = new XMLHttpRequest(),
        defer = Promise.defer();

    xhr.open(method, url, true);

    if (headers) {
        Object.keys(headers).forEach(function(key) {
            xhr.setRequestHeader(key, headers[key]);
        });
    }

    xhr.addEventListener('load', function() {
        defer.resolve(new Response(xhr.responseText));
    });
    xhr.addEventListener('error', function() {
        defer.reject(xhr);
    });

    xhr.send(body);

    return defer.promise
}

function encodeURIParam(obj) {
    var parts = [];
    Object.keys(obj).forEach(function(key) {
        parts.push(key + '=' + encodeURIComponent(obj[key]));
    });
    return parts.join('&')
};

function extend(to, opt_srces) {
    var srces = Array.prototype.slice.call(arguments, 1);

    srces.forEach(function(src) {
        if (!src) {
            return
        }

        Object.keys(src).forEach(function(key) {
            to[key] = src[key];
        });
    });

    return to
};

function Response(val) {
    this.value = val;
}

Response.prototype.json = function() {
    return JSON.parse(this.value);
};


var CLIENT_ID = 'c4139214b24f2d599e6d302cf380ab783f41483a',
    CLIENT_SECRET = '11eb18233e0eb8b57868c82fed4fca580da984b1',
    TOKEN = '5144c41cb2eea35f820c6f05bf346f3402f57764';

_.authorize = function() {
    document.location.href = HOST + '/api/v2/oauth/authorize?' + encodeURIParam({
        client_id: CLIENT_ID,
        scope: 'read_qiita write_qiita'
    });
};

_.getToken = function(code) {
    return _.post(HOST + '/api/v2/access_tokens', {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code
        })
        .then(function(res) {
            console.log(res.json());
        });
};


function Item() {

};


function Comment(data) {
    if (!(this instanceof Comment)) {
        return new Comment(data);
    }

    this.body = data.body || null;
    this.id = data.id || null;
    this.user = User(data.user);
}

/**
 *  コメントの内容
 *  @type {string}
 */
Comment.prototype.body;

/**
 *  リソースを特定するID
 *  @type {string}
 */
Comment.prototype.id;

/**
 *  ユーザー
 *  @type {User}
 */
Comment.prototype.user;

_.getCommentById = function(id) {
    return _.get(HOST + '/api/v2/comments/' + id, null, null)
        .then(function(data) {
            return Comment(data.json());
        });
}

Comment.prototype.remove = function() {
    return _.delete(HOST + '/api/v2/comments/' + id)
};

Comment.prototype.update = function(value) {
    var self = this;

    return _.patch(HOST + '/api/v2/comments/' + id)
        .then(function(data) {
            return self.updateLocalValue(data);
        });
}

Comment.prototype.updateLocalValue = function(data) {
    this.body = data.body || this.body;
    this.id = data.id || this.id;
    this.data && this.user.updateLocalValue(data.user);
};

global.Qi = _;
}(this));
