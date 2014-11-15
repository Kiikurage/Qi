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
