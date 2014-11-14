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

    this.description = data.description || '';
    this.facebook_id = data.facebook_id || '';
    this.followees_count = data.followees_count || 0;
    this.followers_count = data.followers_count || 0;
    this.id = data.id || '';
    this.items_count = data.items_count || 0;
    this.linkedin_id = data.linkedin_id || '';
    this.location = data.location || '';
    this.name = data.name || '';
    this.organization = data.organization || '';
    this.profile_image_url = data.profile_image_url || '';
    this.twitter_screen_name = data.twitter_screen_name || '';
    this.website_url = data.website_url || '';
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
 * @returns {Promise<[User]>} すべてのユーザーの一覧
 */
Qi.getUsers = function () {
    return Qi.get(HOST + '/api/v2/users', null, null)
        .then(function (res) {
            return res.json().map(User);
        })
};

/**
 * 特定のユーザーを取得する
 * @param {string} id ユーザーID
 * @returns {Promise<User>} 特定のユーザー
 */
Qi.getUserById = function (id) {
    return Qi.get(HOST + '/api/v2/users/' + id, null, null)
        .then(function (res) {
            return User(res.json())
        })
};

/**
 * アクセストークンに紐付いたユーザーを取得する
 * @returns {Promise<User>} ユーザー
 */
Qi.getUserById = function () {
    return Qi.get(HOST + '/api/v2/authenticated_user', null, null)
        .then(function (res) {
            return User(res.json())
        })
};

/**
 * 特定のユーザーがフォローしているユーザーを取得する
 * @param {string} id ユーザーID
 * @returns {Promise<[User]>} ユーザー
 */
Qi.getFolloweesById = function (id) {
    return Qi.get(HOST + '/api/v2/users/' + id + '/followees', null, null)
        .then(function (res) {
            return res.json().map(User)
        })
};

/**
 * 特定のユーザーをフォローしているユーザーを取得する
 * @param {string} id ユーザーID
 * @returns {Promise<[User]>} ユーザー
 */
Qi.getFollowersById = function (id) {
    return Qi.get(HOST + '/api/v2/users/' + id + '/followers', null, null)
        .then(function (res) {
            return res.json().map(User)
        })
};

Qi.User = User;