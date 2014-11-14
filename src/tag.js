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
 * @returns {Promise<[Tag]>} タグの配列
 */
Qi.getTags = function () {
    return Qi.get(HOST + '/api/v2/tags/', null, null)
        .then(function (res) {
            return res.json().map(Tag)
        })
};

/**
 * 指定されたタグを取得する
 * @param {string} id タグid
 * @returns {Promise<Tag>} タグ
 */
Qi.getTag = function (id) {
    return Qi.get(HOST + '/api/v2/tags/' + id, null, null)
};

/**
 * 特定のユーザーがフォローしているタグ一覧を取得する
 * @param {string} user_id ユーザーid
 * @returns {Promise<[Tag]>} タグの配列
 */
Qi.getFollowingTags = function (user_id) {
    return Qi.get(HOST + '/api/v2/comments/' + id + '/following_tags')
        .then(function (res) {
            return res.json().map(Tag)
        })
};

Qi.Tag = Tag;
