(function (global) {
    var HOST = 'https://qiita.com',
        Qi = {};
/**
 * 初期化を行う。すべてのAPIの前に呼び出す必要がある。
 * @param {{
 *      clientId: string,
 *      clientSecret: string,
 *      token: string
 * }} params 初期化パラメータ
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
Qi.clientId_;

/**
 * クライアントSecret
 * @type {string}
 * @private
 */
Qi.clientSecret_;

/**
 * アクセストークン
 * @type {string}
 * @private
 */
Qi.accessToken_;

/**
 * アプリの認証を行う
 * @param {{
 *      readQiita: boolean,
 *      writeQiita: boolean,
 *      newWindow: boolean
 * }} [option] オプション
 */
Qi.authorize = function (option) {
    option = Qi.extend({
        read: true,
        write: true,
        newWindow: false
    }, option);

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
    return Qi.httpPost(HOST + '/api/v2/access_tokens', {
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
    return Qi.httpDelete(HOST + '/api/v2/access_tokens' + Qi.accessToken_)
        .then(function (res) {
            Qi.accessToken_ = '';
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
Qi.httpGet = function (url, param, headers) {
    if (param) {
        url += '?' + Qi.encodeURIParam(param);
    }

    if (Qi.accessToken_) {
        headers = headers || {};
        headers.Authorization = 'Bearer ' + Qi.accessToken_;
    }

    return Qi.ajax('GET', url, headers, '')

};

/**
 * HTTP::POSTメソッド
 * @param {string} url
 * @param {Object} [param] 本文
 * @param {Object} [headers] カスタムヘッダ
 *
 * @returns {Promise<Response>} プロミスオブジェクト
 */
Qi.httpPost = function (url, param, headers) {
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
Qi.httpPut = function (url, param, headers) {
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
Qi.httpPatch = function (url, param, headers) {
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
 * @returns {Promise<Response>} プロミスオブジェクト
 */
Qi.httpDelete = function (url, param, headers) {
    if (Qi.accessToken_) {
        headers = headers || {};
        headers.Authorization = 'Bearer ' + Qi.accessToken_;
    }

    return Qi.ajax('DELETE', url, headers, '')
};

/**
 * Ajaxのコア機能
 * @param {string} method 使用するHTTPメソッド
 * @param {string} url URL
 * @param {Object} [headers] ヘッダ
 * @param {string} [body] 本文
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
 * @returns {*} targetで指定されたコピー先オブジェクト
 */
Qi.extend = function (target, opt_srces) {
    Array.prototype.slice.call(arguments, 1).forEach(function (src) {
        for (var key in src) {
            target[key] = src[key];
        }
    });

    return target;
};

/**
 * サーバーからのレスポンスを表すクラス
 * @param {XMLHttpRequest} xhr 通信で使用したXMLHttpRequestオブジェクト
 * @constructor
 */
function Response(xhr) {
    this.headers = parseHeader(xhr.getAllResponseHeaders());
    this.body = xhr.responseText;
    this.xhr = xhr;
}

/**
 * レスポンスをJSONとしてパースする
 * @returns {Object} レスポンス
 */
Response.prototype.json = function () {
    return JSON.parse(this.body);
};

/**
 * ヘッダをオブジェクトに変換する
 * @param {string} text ヘッダ文字列
 * @returns {Object} 変換されたオブジェクト
 */
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


/**
 * イテレーション可能なリクエストのラッパークラス
 * @param {Object} params 各種パラメータ
 * @constructor
 */
function Iterator(res, data, delegate) {
    if (!(this instanceof Iterator)) {
        return new Iterator(res, data)
    }

    this.data = data || null;
    this.delegate = delegate;

    console.log(res.xhr.getResponseHeader('Link'));
}


/**
 * 先頭の要素を呼び出すURL
 * @type {string}
 */
Iterator.prototype.firstURL;

/**
 * 前の要素を呼び出すURL
 * @type {string}
 */
Iterator.prototype.prevURL;

/**
 * 次の要素を呼び出すURL
 * @type {string}
 */
Iterator.prototype.nextURL;

/**
 * 末尾の要素を呼び出すURL
 * @type {string}
 */
Iterator.prototype.lastURL;

/**
 * イテレータの値
 * @type {*}
 */
Iterator.prototype.data;

/**
 * 現在のページ数
 * @type {number}
 */
Iterator.prototype.now;

/**
 * 総ページ数
 * @type {number}
 */
Iterator.prototype.total;

/**
 * 処理の委譲先
 * @type {function}
 */
Iterator.prototype.delegate;

/**
 * 最初の要素を呼び出す
 * @returns {Promise<Iterator>} 最初の要素を表すイテレータ
 */
Iterator.prototype.first = function () {
    return this.iterate(this.firstURL)
};

/**
 * 前の要素を呼び出す
 * @returns {Promise<Iterator>} 前の要素を表すイテレータ
 */
Iterator.prototype.prev = function () {
    return this.iterate(this.prevURL)
};

/**
 * 次の要素を呼び出す
 * @returns {Promise<Iterator>} 次の要素を表すイテレータ
 */
Iterator.prototype.next = function () {
    return this.iterate(this.nextURL)
};

/**
 * 最後の要素を呼び出す
 * @returns {Promise<Iterator>} 最後の要素を表すイテレータ
 */
Iterator.prototype.last = function () {
    return this.iterate(this.lastURL)
};

/**
 * イテレーションを行う
 * @param {string} url 移動先の要素のURL
 * @param {function} delegate 委譲先の関数
 * @returns {Promise<Iterator>} 移動先の要素を表すイテレータ
 */
Iterator.iterate = function (url, delegate) {
    if (url === null) {
        throw new Error('Can not iterate more.');
    }

    return Qi.httpGet(url)
        .then(function (res) {
            return new Iterator(res, delegate(res), delegate);
        })
};

/**
 * 投稿を表すクラス
 * @param {string} data.body;
 * @param {boolean} data.coediting;
 * @param {string} data.id;
 * @param {boolean} data.private;
 * @param {[Tag]} data.tags;
 * @param {string} data.title;
 * @param {User} data.user;
 * @constructor
 */
function Item(data) {
    if (!(this instanceof Item)) {
        return new Item(data)
    }
    if (data instanceof Item) {
        return data
    }

    this.body = data.body || null;
    this.coediting = typeof data.coediting === 'boolean' ? data.coediting : false;
    this.id = data.id || null;
    this.private = typeof data.private === 'boolean' ? data.private : false;
    this.tags = data.tags instanceof Array ? data.tags.map(Tag) : [];
    this.title = data.title || null;
    this.user = data.user ? User(data.user) : null;
}

/**
 * 投稿の本文
 * @type {string}
 */
Item.prototype.body;

/**
 * 未対応
 * @type {boolean}
 */
Item.prototype.coediting;

/**
 * 作成された日時
 * @type {Date}
 */
Item.prototype.created_at;

/**
 * リソースを特定するためのID
 * @type {string}
 */
Item.prototype.id;

/**
 * 未対応
 * @type {boolean}
 */
Item.prototype.private;

/**
 * 紐付けられたタグ
 * @type {[tags]}
 */
Item.prototype.tags;

/**
 * タイトル
 * @type {string}
 */
Item.prototype.title;

/**
 * 投稿者
 * @type {User}
 */
Item.prototype.user;

/**
 * 新着順にすべての投稿一覧を取得する
 * @returns {Promise<Iterator<[Item]>>} 投稿一覧
 */
Qi.getItems = function () {
    return Iterator.iterate(HOST + '/api/v2/items', function (res) {
        return res.json().map(Item);
    })
};

/**
 * 新しい投稿を作成する(POST /api/v2/items)
 */
Qi.createItem = function () {
    //TODO: Implement
    throw new Error('N.I.Y.');
};

/**
 * 特定の投稿を取得する
 * @param {string} id 投稿ID
 * @returns {Promise<Item>} 投稿
 */
Qi.getItemById = function (id) {
    return Qi.httpGet(HOST + '/api/v2/items/' + id, null, null)
        .then(function (data) {
            return Item(data.json());
        })
};

/**
 * 特定の投稿を編集する(PATCH /api/v2/items/:id
 */
Qi.updateItem = function () {
    //TODO: Implement
    throw new Error('N.I.Y.');
};

/**
 * 特定の投稿を削除する(DELETE /api/v2/items/:id
 */
Qi.deleteItem = function () {
    //TODO: Implement
    throw new Error('N.I.Y.');
};

/**
 * 特定の投稿をストックする
 * @param {string} item_id 投稿ID
 * @return {Promise<Response>} サーバーからのレスポンス
 */
Qi.addStock = function (item_id) {
    Qi.httpPut(HOST + '/api/v2/items/' + item_id + '/stock', null, null)
};

/**
 * 特定の投稿をストックから取り除く
 * @param {string} item_id 投稿ID
 * @return {Promise<Response>} サーバーからのレスポンス
 */
Qi.deleteStock = function (item_id) {
    Qi.httpDelete(HOST + '/api/v2/items/' + item_id + '/stock', null, null)
};

/**
 * 特定の投稿に「いいね」をつける
 * @param {string} item_id 投稿ID
 * @return {Promise<Response>} サーバーからのレスポンス
 */
Qi.addStock = function (item_id) {
    Qi.httpPut(HOST + '/api/v2/items/' + item_id + '/lgtm', null, null)
};

/**
 * 特定の投稿への「いいね」を取り消す
 * @param {string} item_id 投稿ID
 * @return {Promise<Response>} サーバーからのレスポンス
 */
Qi.deleteStock = function (item_id) {
    Qi.httpDelete(HOST + '/api/v2/items/' + item_id + '/lgtm', null, null)
};

/**
 * 投稿に寄せられたコメント一覧を取得する
 * @returns {Promise<Iterator<[Comment]>>} コメント一覧
 */
Item.prototype.getComments = function () {
    return Iterator.iterate(HOST + '/api/v2/items/' + this.id + '/comments', function (res) {
        return res.json().map(Comment);
    });
};

/**
 * 投稿をストックしているユーザー一覧を取得する
 * @returns {Promise<Iterator<[User]>>} ストックしているユーザー
 */
Item.prototype.getStockers = function () {
    return Iterator.iterate(HOST + '/api/v2/items/' + this.id + '/stockers', function (res) {
        return res.json().map(User);
    });
};

Qi.Item = Item;


/**
 * コメントを表すクラス
 * @param {string} data.body コメント内容
 * @param {string} data.id コメントを特定するID
 * @param {User|Object} data.user 投稿者
 * @constructor
 */
function Comment(data) {
    if (!(this instanceof Comment)) {
        return new Comment(data)
    }
    if (data instanceof Comment) {
        return data
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
 *  コメントを特定するID
 *  @type {string}
 */
Comment.prototype.id;

/**
 *  ユーザー
 *  @type {User}
 */
Comment.prototype.user;

/**
 * 指定されたコメントを取得する
 * @param {string} id コメントID
 * @returns {Promise<Comment>} コメント
 */
Qi.getCommentById = function (id) {
    return Qi.httpGet(HOST + '/api/v2/comments/' + id, null, null)
        .then(function (res) {
            return Comment(res.json());
        });
};

/**
 * 指定されたコメントを削除する
 * @param {string} id コメントID
 * @returns {Promise<Response>} サーバーからのレスポンス
 */
Qi.removeCommentById = function (id) {
    return Qi.httpDelete(HOST + '/api/v2/comments/' + id)
};

/**
 * 指定されたコメントを更新する
 * @param {string} id コメントID
 * @param {string} body 更新内容
 * @returns {Promise<Response>} サーバーからのレスポンス
 */
Qi.updateCommentById = function (id, body) {
    return Qi.httpPatch(HOST + '/api/v2/comments/' + id, {
        body: body
    })
};

/**
 * 特定の投稿へのコメント一覧を取得する
 * @param {string} item_id 投稿ID
 * @return {Promise<Iterator<[Comment]>} コメント一覧
 */
Qi.getCommentsByItemId = function (item_id) {
    return Iterator.iterate(HOST + ' /api/v2/items/' + item_id + '/comments', function (res) {
        return res.json().map(Comment)
    });
};

/**
 * 指定されたコメントにThankをつける
 * @param {string} id コメントID
 * @returns {Promise<Response>} サーバーからのレスポンス
 */
Qi.setThankById = function (id) {
    return Qi.httpPut(HOST + '/api/v2/comments/' + id + '/thank')
};

/**
 * 指定されたコメントのThankを外す
 * @param {string} id コメントID
 * @returns {Promise<Response>} サーバーからのレスポンス
 */
Qi.removeThankById = function (id) {
    return Qi.httpDelete(HOST + '/api/v2/comments/' + id + '/thank')
};

/**
 * コメントを削除する
 * @returns {Promise<Response>} サーバーからのレスポンス
 */
Comment.prototype.remove = function () {
    return Qi
        .removeCommentById(this.id)
};

/**
 * コメントを更新する
 * @param {string} body 更新内容
 * @returns {Promise<Response>} サーバーからのレスポンス
 */
Comment.prototype.update = function (body) {
    var self = this;

    return Qi
        .updateCommentById(this.id, body)
        .then(function (res) {
            self.updateLocalValue(res.json());
            return res;
        });
};

/**
 * コメントにThankをつける
 * @returns {Promise<Response>} サーバーからのレスポンス
 */
Comment.prototype.setThank = function () {
    return Qi.setThankById(this.id);
};

/**
 * コメントのThankを外す
 * @returns {Promise.<Response>}
 */
Comment.prototype.removeThank = function () {
    return Qi.removeThankById(this.id);
};

/**
 * ローカルの値を更新する
 * @param {Object} data 更新内容
 * @param {string} [data.id] 更新内容
 * @param {string} [data.body] 本文
 * @param {Object} [data.user] 投稿者
 */
Comment.prototype.updateLocalValue = function (data) {
    data = {};
    this.body = data.body || this.body;
    this.id = data.id || this.id;
    this.user && this.user.updateLocalValue(data.user);
};

Qi.Comment = Comment;


/**
 * ユーザーを表すクラス
 * @param {string} data.description
 * @param {string} data.facebook_id
 * @param {number} data.followees_count
 * @param {number} data.followers_count
 * @param {string} data.id
 * @param {number} data.items_count
 * @param {string} data.linkedin_id
 * @param {string} data.location
 * @param {string} data.name
 * @param {string} data.organization
 * @param {string} data.profile_image_url
 * @param {string} data.twitter_screen_name
 * @param {string} data.website_url
 * @constructor
 */
function User(data) {
    if (!(this instanceof User)) {
        return new User(data)
    }
    if (data instanceof User) {
        return data
    }

    this.description = data.description || null;
    this.facebook_id = data.facebook_id || null;
    this.followees_count = data.followees_count || null;
    this.followers_count = data.followers_count || null;
    this.id = data.id || null;
    this.items_count = data.items_count || null;
    this.linkedin_id = data.linkedin_id || null;
    this.location = data.location || null;
    this.name = data.name || null;
    this.organization = data.organization || null;
    this.profile_image_url = data.profile_image_url || null;
    this.twitter_screen_name = data.twitter_screen_name || null;
    this.website_url = data.website_url || null;
}

/**
 * 自己紹介文
 * @type {string}
 */
User.prototype.description;

/**
 * FacebookのID
 * @type {string}
 */
User.prototype.facebook_id;

/**
 * このユーザーがフォローしているユーザー数
 * @type {number}
 */
User.prototype.followees_count;

/**
 * このユーザーをフォローしているユーザー数
 * @type {number}
 */
User.prototype.followers_count;

/**
 * ユーザーを特定するためのID
 * @type {string}
 */
User.prototype.id;

/**
 * このユーザーの投稿数
 * @type {number}
 */
User.prototype.items_count;

/**
 * LinkedInのID
 * @type {string}
 */
User.prototype.linkedin_id;

/**
 * 居住地
 * @type {string}
 */
User.prototype.location;

/**
 * 名前
 * @type {User}
 */
User.prototype.name;

/**
 * 所属している組織
 * @type {string}
 */
User.prototype.organization;

/**
 * 設定しているプロフィール画像のURL
 * @type {string}
 */
User.prototype.profile_image_url;

/**
 * TwitterのID
 * @type {string}
 */
User.prototype.twitter_screen_name;

/**
 * サイトのURL
 * @type {string}
 */
User.prototype.website_url;

/**
 * すべてのユーザーの一覧を取得する
 * @returns {Promise<Iterator<[User]>>} すべてのユーザーの一覧
 */
Qi.getUsers = function () {
    return Iterator.iterate(HOST + '/api/v2/users', function (res) {
        return res.json().map(User);
    })
};

/**
 * 特定のユーザーを取得する
 * @param {string} id ユーザーID
 * @returns {Promise<User>} 特定のユーザー
 */
Qi.getUserById = function (id) {
    return Qi.httpGet(HOST + '/api/v2/users/' + id, null, null)
        .then(function (res) {
            return User(res.json())
        })
};

/**
 * アクセストークンに紐付いたユーザーを取得する
 * @returns {Promise<User>} ユーザー
 */
Qi.getTokenUser = function () {
    return Qi.httpGet(HOST + '/api/v2/authenticated_user', null, null)
        .then(function (res) {
            return User(res.json())
        })
};

/**
 * 特定のユーザーがフォローしているユーザーを取得する
 * @param {string} id ユーザーID
 * @returns {Promise<Iterator<[User]>>} ユーザー
 */
Qi.getFolloweesById = function (id) {
    return Iterator.iterate(HOST + '/api/v2/users/' + id + '/followees', function (res) {
        return res.json().map(User)
    })
};

/**
 * 特定のユーザーをフォローしているユーザーを取得する
 * @param {string} id ユーザーID
 * @returns {Promise<[User]>} ユーザー
 */
Qi.getFollowersById = function (id) {
    return Iterator.iterate(HOST + '/api/v2/users/' + id + '/followers', function (res) {
        return res.json().map(User)
    })
};

/**
 * 特定のユーザーの投稿一覧を取得する
 * @param {string} user_id ユーザー
 * @returns {Promise<Iterator<[Item]>>} ユーザー
 */
Qi.getItemsByUser = function (user_id) {
    return Iterator.iterate(HOST + '/api/v2/users/' + user_id + '/items', function (res) {
        return res.json().map(Item)
    })
};

/**
 * 特定のユーザーがストックした投稿一覧を取得する
 * @param {string} user_id ユーザー
 * @returns {Promise<Iterator<[Item]>>} ユーザー
 */
Qi.getItemsByUser = function (user_id) {
    return Iterator.iterate(HOST + '/api/v2/users/' + user_id + '/stockes', function (res) {
        return res.json().map(Item)
    })
};

Qi.User = User;

/**
 * タグを表すクラス
 * @param {number} data.followers_count タグをフォローしているユーザー数
 * @param {number} data.icon_url アイコン画像のURL
 * @param {string} data.id タグを特定するための一意な名前
 * @param {number} data.items_count タグが付けられた投稿の数
 * @constructor
 */
function Tag(data) {
    if (!(this instanceof Tag)) {
        return new Tag(data)
    }
    if (data instanceof Tag) {
        return data
    }

    this.followers_count = data.followers_count || 0;
    this.icon_url = data.icon_url || null;
    this.id = data.id || null;
    this.items_count = data.items_count || 0;
}

/**
 *  タグをフォローしているユーザー数
 *  @type {number}
 */
Tag.prototype.followers_count;

/**
 *  アイコン画像のURL
 *  @type {number}
 */
Tag.prototype.icon_url;

/**
 *  タグを特定するための一意な名前
 *  @type {string}
 */
Tag.prototype.id;

/**
 *  タグが付けられた投稿の数
 *  @type {number}
 */
Tag.prototype.items_count;

/**
 * すべてのタグ一覧を取得する
 * @returns {Promise<Iterator<[Tag]>>} タグの配列
 */
Qi.getTags = function () {
    return Iterator.iterate(HOST + '/api/v2/tags/', function (res) {
        return res.json().map(Tag)
    })
};

/**
 * 指定されたタグを取得する
 * @param {string} id タグid
 * @returns {Promise<Tag>} タグ
 */
Qi.getTag = function (id) {
    return Qi.httpGet(HOST + '/api/v2/tags/' + id, null, null)
};

/**
 * 特定のユーザーがフォローしているタグ一覧を取得する
 * @param {string} user_id ユーザーid
 * @returns {Promise<Iterator<[Tag]>>} タグの配列
 */
Qi.getFollowingTags = function (user_id) {
    return Iterator.iterate(HOST + '/api/v2/comments/' + user_id + '/following_tags', function (res) {
        return res.json().map(Tag)
    })
};

/**
 * 特定のタグに紐付けられた投稿一覧を取得する
 * @param {string} tag_id タグID
 * @returns {Promise<Iterator<[Item]>>} 投稿
 */
Qi.getItemsByTag = function (tag_id) {
    return Iterator.iterate(HOST + '/api/v2/tags/' + tag_id + '/id', function (data) {
        return data.json().map(Item);
    })
};


Qi.Tag = Tag;

global.Qi = Qi;
}(this));