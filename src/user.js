function User(data) {
    if (!(this instanceof User)) {
        return new User(data)
    }

    data = data || {};

    this.name = data.name || '';
    this.urlName = data.url_name || '';
    this.profileImageUrl = data.profile_image_url || data.icon_url || '';
    this.description = data.description || '';
    this.websiteUrl = data.website_url || '';
    this.organization = data.organization || '';
    this.location = data.location || '';
    this.facebook = data.facebook || '';
    this.linkedin = data.linkedin || '';
    this.twitter = data.twitter || '';
    this.github = data.github || '';
    this.followersCount = data.followers || 0;
    this.followingUsersCount = data.following_users || 0;
    this.items = data.items || 0;

    //TODO: implement
    /**
     *	data.teamsは配列
     *	オブジェクトなので値のディープコピーが必要
     */
    this.teams = [];
}

User.me = function() {
    return _
        .fetchWithToken(Url.USER)
        .then(function(res) {
            return res.json();
        })
        .then(function(json) {
            return new User(json);
        })
};

User.getByName = function(name) {
    return _
        .fetch(Url.USERS
            .replace(Param.USERNAME, name))
        .then(function(res) {
            return res.json();
        })
        .then(User)
};

User.prototype.getItems = function() {
    //TODO: next
    return _
        .fetch(
            Url.USERS_ITEM
            .replace(Param.USERNAME, this.urlName)
        )
        .then(function(res) {
            return res.json();
        })
        .then(function(jsons) {
            return jsons.map(Item);
        })
};

User.prototype.getStocks = function() {
    //TODO: next
    return _
        .fetch(
            Url.USERS_STOCK
            .replace(Param.USERNAME, this.urlName)
        )
        .then(function(res) {
            return res.json();
        })
        .then(function(jsons) {
            return jsons.map(Item);
        })
};

User.prototype.getFollowingUsers = function() {
    //TODO: next
    return _
        .fetch(
            Url.USERS_FOLLOWING_USERS
            .replace(Param.USERNAME, this.urlName)
        )
        .then(function(res) {
            return res.json();
        })
        .then(function(jsons) {
            return jsons.map(User)
        })
};

User.prototype.getFollowingTags = function() {
    //TODO: next
    return _
        .fetch(
            Url.USERS_FOLLOWING_TAGS
            .replace(Param.USERNAME, this.urlName)
        )
        .then(function(res) {
            return res.json();
        })
};

Qi.User = User;