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
    return Qi.get(HOST + '/api/v2/comments/' + id, null, null)
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
    return Qi.delete(HOST + '/api/v2/comments/' + id)
};

/**
 * 指定されたコメントを更新する
 * @param {string} id コメントID
 * @param {string} body 更新内容
 * @returns {Promise<Response>} サーバーからのレスポンス
 */
Qi.updateCommentById = function (id, body) {
    return Qi.patch(HOST + '/api/v2/comments/' + id, {
        body: body
    })
};

/**
 * 特定の投稿へのコメント一覧を取得する
 * @param {string} item_id 投稿ID
 * @return {Promise<Iterator<[Comment]>>} コメント一覧
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
    return Qi.put(HOST + '/api/v2/comments/' + id + '/thank')
};

/**
 * 指定されたコメントのThankを外す
 * @param {string} id コメントID
 * @returns {Promise<Response>} サーバーからのレスポンス
 */
Qi.removeThankById = function (id) {
    return Qi.delete(HOST + '/api/v2/comments/' + id + '/thank')
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
