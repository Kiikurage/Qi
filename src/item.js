function Item() {
    this.comments = [];
}

Item.prototype.body = 
/**
 * 投稿に寄せられたコメント一覧を取得する
 * @returns {Promise<[Comment]>} コメント一覧
 */
Item.prototype.getComments = function () {
    return Qi.get(HOST + '/api/v2/items/' + this.id + '/comments', null, null)
        .then(function (res) {
            return res.json().map(Comment);
        });
};

/**
 * 投稿をストックしているユーザー一覧を取得する
 * @returns {Promise<[User]>} ストックしているユーザー
 */
Item.prototype.getStockers = function () {
    return Qi.get(HOST + '/api/v2/items/' + this.id + '/stockers', null, null)
        .then(function (res) {
            return res.json().map(User);
        });
};

Qi.Item = Item;
