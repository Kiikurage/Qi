(function (global) {
    var HOST = 'https://qiita.com',
        Qi = {};
/**
 * 初期化を行う。すべてのAPIの前に呼び出す必要がある。
 * @param {string} params.clientId クライアントID
 * @param {string} params.clientSecret クライアントSecret
 * @param {string} [params.token=''] アクセストークン
 */
Qi.init = function (params) {
    if (params.token) {
        Qi.accessToken_ = params.token;
    }

    Qi.clientId_ = params.clientId;
    Qi.clientSecret_ = params.clientSecret;

    if (!Qi.clientId_ || !Qi.clientSecret_) {
        throw new Error('Qi.init() must be called with params.clientID and parms.clientSecret.');
    }
};

/**
 * クライアントID
 * @type {string}
 * @private
 */
Qi.clientId_ = null;

/**
 * クライアントSecret
 * @type {string}
 * @private
 */
Qi.clientSecret_ = null;

/**
 * アクセストークン
 * @type {string}
 * @private
 */
Qi.accessToken_ = null;

/**
 * アプリの認証を行う
 * @param {boolean} [option.readQiita=true] read_qitaスコープを要求するか
 * @param {boolean} [option.writeQiita=true] write_qitaスコープを要求するか
 * @param {boolean} [option.newWindow=false] 認証画面を別画面で開くか
 */
Qi.authorize = function (option) {
    option = Qi.extend({
        read: true,
        write: true,
        newWindow: false
    });

    var scopes = [],
        url;

    if (option.read) scopes.push('read_qiita');
    if (option.write) scopes.push('write_qiita');

    url = document.location.href = HOST + '/api/v2/oauth/authorize?' + Qi.encodeURIParam({
        client_id: CLIENT_ID,
        scope: scopes.join(' ')
    });

    if (option.newWindow) {
        window.open(url);
    } else {
        document.location.href = url;
    }
};

/**
 * コードをトークンに変換する
 * @param {string} code コード
 *
 * @returns {Promise<Response>} プロミスオブジェクト
 */
Qi.getToken = function (code) {
    return Qi.post(HOST + '/api/v2/access_tokens', {
        client_id: Qi.clientId_,
        client_secret: Qi.clientSecret_,
        code: code
    })
        .then(function (res) {
            Qi.accessToken_ = res.json().token;
            return res
        });
};

/**
 * トークンを削除する
 * @returns {Promise<Response>} プロミスオブジェクト
 */
Qi.deleteToken = function (code) {
    return Qi.delete(HOST + '/api/v2/access_tokens' + Qi.accessToken_)
        .then(function (res) {
            Qi.accessToken_ = null;
            return res
        });
};

/**
 * HTTP::GETメソッド
 * @param {string} url
 * @param {Object} [param] URLパラメータ
 * @param {Object} [headers] カスタムヘッダ
 *
 * @returns {Promise<Response>} プロミスオブジェクト}
 */
Qi.get = function (url, param, headers) {
    if (param) {
        url += '?' + Qi.encodeURIParam(param);
    }

    if (Qi.accessToken_) {
        headers = headers || {};
        headers.Authorization = 'Bearer ' + Qi.accessToken_;
    }

    return request.ajax('GET', url, headers, null)

};

/**
 * HTTP::POSTメソッド
 * @param {string} url
 * @param {Object} [param] 本文
 * @param {Object} [headers] カスタムヘッダ
 *
 * @returns {Promise<Response>} プロミスオブジェクト
 */
Qi.post = function (url, param, headers) {
    if (Qi.accessToken_) {
        headers = headers || {};
        headers.Authorization = 'Bearer ' + Qi.accessToken_;
    }

    return Qi.ajax('POST', url, Qi.extend({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }, headers), JSON.stringify(param))
};

/**
 * HTTP::PUTメソッド
 * @param {string} url
 * @param {Object} [param] 本文
 * @param {Object} [headers] カスタムヘッダ
 *
 * @returns {Promise<Response>} プロミスオブジェクト
 */
Qi.put = function (url, param, headers) {
    if (Qi.accessToken_) {
        headers = headers || {};
        headers.Authorization = 'Bearer ' + Qi.accessToken_;
    }

    return Qi.ajax('PUT', url, Qi.extend({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }, headers), JSON.stringify(param))
};

/**
 * HTTP::PATCHメソッド
 * @param {string} url
 * @param {Object} [param] 本文
 * @param {Object} [headers] カスタムヘッダ
 *
 * @returns {Promise<Response>} プロミスオブジェクト
 */
Qi.patch = function (url, param, headers) {
    return Qi.ajax('PATCH', url, Qi.extend({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }, headers), JSON.stringify(param))
};

/**
 * HTTP::DELETEメソッド
 * @param {string} url
 * @param {Object} [param] URLパラメータ
 * @param {Object} [headers] カスタムヘッダ
 *
 * @returns {Promise<Response>} プロミスオブジェクト
 */
Qi.delete = function (url, param, headers) {
    if (Qi.accessToken_) {
        headers = headers || {};
        headers.Authorization = 'Bearer ' + Qi.accessToken_;
    }

    return Qi('DELETE', url, headers, null)
};

/**
 * Ajaxのコア機能
 * @param {string} method 使用するHTTPメソッド
 * @param {string} url URL
 * @param {Object} [headers] ヘッダ
 * @param {Object} [body] 本文
 *
 * @returns {Promise<Response>} プロミスオブジェクト
 */
Qi.ajax = function (method, url, headers, body) {
    var xhr = new XMLHttpRequest(),
        defer = Promise.defer();

    xhr.open(method, url, true);

    if (headers) {
        Object.keys(headers).forEach(function (key) {
            xhr.setRequestHeader(key, headers[key]);
        });
    }

    xhr.addEventListener('load', function () {
        defer.resolve(new Response(xhr));
    });
    xhr.addEventListener('error', function () {
        defer.reject(xhr);
    });

    xhr.send(body);

    return defer.promise
};

/**
 * オブジェクトをURLパラメータ形式に変換する
 * @param {Object} obj 変換するオブジェクト
 *
 * @returns {string} 変換された文字列
 */
Qi.encodeURIParam = function (obj) {
    var parts = [];
    Object.keys(obj).forEach(function (key) {
        parts.push(key + '=' + encodeURIComponent(obj[key]));
    });
    return parts.join('&')
};

/**
 * オブジェクトのプロパティを拡張する
 * @param {Object} target コピー先オブジェクト
 * @param {...Object} [opt_srces] コピー元オブジェクト
 *
 * @returns {Object} targetで指定されたコピー先オブジェクト
 */
Qi.extend = function (target, opt_srces) {
    Array.prototype.slice.call(arguments, 1).forEach(function (src) {
        for (var key in src) {
            target[key] = src[key];
        }
    });

    return target;
};

function Response(xhr) {
    console.log(xhr.getAllResponseHeaders());
    this.header = parseHeader(xhr.getAllResponseHeaders());
    this.body = xhr.responseText;
}

Response.prototype.json = function () {
    return JSON.parse(this.body);
};

function parseHeader(text) {
    var val = {};

    text.split('\n').forEach(function (keyAndVal) {
        var parts = keyAndVal.split(':');

        if (parts[0] === '') {
            return
        }

        val[parts[0]] = parts[1];
    });

    return val
}




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

Qi.getCommentById = function (id) {
    return Qi.get(HOST + '/api/v2/comments/' + id, null, null)
        .then(function (res) {
            return Comment(res.json());
        });
};

Qi.removeCommentById = function (id) {
    return Qi.delete(HOST + '/api/v2/comments/' + id)
};

Qi.updateCommentById = function (id, value) {
    return Qi.patch(HOST + '/api/v2/comments/' + id, value)
};

Comment.prototype.remove = function () {
    return Qi.removeCommentById(this.id);
};

Comment.prototype.update = function (value) {
    return Qi.updateCommentById(this.id, value);
};

Comment.prototype.updateLocalValue = function (data) {
    this.body = data.body || this.body;
    this.id = data.id || this.id;
    this.user && this.user.updateLocalValue(data.user);
};

Qi.Comment = Comment;


function User(data) {
    if (!(this instanceof User)) {
        return new User(data);
    }
}
global.Qi = Qi;
}(this));

var CLIENT_ID = 'c4139214b24f2d599e6d302cf380ab783f41483a',
    CLIENT_SECRET = '11eb18233e0eb8b57868c82fed4fca580da984b1';

Qi.init({
    token: '82f40809d9c81666836a1694c4a2f3605f18f129',
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET
});