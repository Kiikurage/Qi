function Item() {

    this.comments = [];
}

/**
 * 投稿に寄せられたコメント一覧を取得する
 * @returns {*}
 */
Item.prototype.getComment = function () {
    return Qi.get(HOST + '/api/v2/items/' + this.id + 'comments', null, null)
        .then(function (res) {
            return res.json().map(Comment);
        });
};

Item.prototype.postComment = function (body) {
    var self = this;
    return Qi
        .post(HOST + '/api/v2/items/' + this.id + 'comments', {
            body: body
        }, null)
        .then(function (res) {
            self.comments.push(Comment(res.json()));
        });
};

Qi.Item = Item;
