function Item(data) {
    if (!(this instanceof Item)) {
        return new Item(data)
    }

    data = data || {};

    this.id = data.id || 0;
    this.uuid = data.uuid || '';
    this.user = data.user ? new User(data.user) : null;
    this.title = data.title || '';
    this.body = data.body || '';
    this.created = {
        date: (data.created_at ? new Date(data.created_at) : null),
        word: (data.created_at_in_words || '')
    };
    this.updated = {
        date: (data.updated_at ? new Date(data.updated_at) : null),
        word: (data.updated_at_in_words || '')
    };
    this.tags = data.tags ? data.tags.slice(0) : [];
    this.stockCount = data.stock_count || 0;
    this.stockUsers = data.stock_users ? data.stock_users.slice(0) : [];
    this.commentCount = data.comment_count || 0;
    this.url = data.url || '';
    this.gistUrl = data.gist_url || '';
    this.tweet = data.tweet || false;
    this.private = data.tweet || false;
    this.stocked = data.tweet || false;
    this.comments = data.comments ? data.comments.map(Qi.Comment) : [];
}
Qi.Item = Item;

Item.prototype.stock = function() {
    return _
        .fetch(Url.ITEMS_STOCK
            .replace(Param.UUID, this.uuid), {
                method: 'PUT'
            })
        .then(function(res) {
            this.stocked = true;
            return res
        })
};

Item.prototype.unstock = function() {
    return _
        .fetch(Url.ITEMS_STOCK
            .replace(Param.UUID, this.uuid), {
                method: 'DELETE'
            })
        .then(function(res) {
            this.stocked = false;
            return res
        })
};

Item.getMyStocks = function() {
    return _
        .fetchWithToken(Url.STOCKS)
        .then(function(res) {
            return res.json();
        })
        .then(function(jsons) {
            return jsons.map(Item);
        })

    //TODO:Next
};

Item.search = function(query) {
    return _
        .fetch(Url.SEARCH, {
            urlParams: {
                q: query
            }
        })
        .then(function(res) {
            return res.json();
        })
        .then(function(jsons) {
            return jsons.map(Item);
        })

    //TODO:Next
};

Item.getByTag = function(tag) {
    if (!tag) {
        throw new Error('"Item.getByTag" must be passed one parameter');
    }

    return _
        .fetch(
            Url.TAGS_ITEMS
            .replace(Param.TAGNAME, tag)
        )
        .then(function(res) {
            return res.json();
        })
        .then(function(jsons) {
            return jsons.map(Item);
        })

    //TODO:Next
};

Item.getById = function(uuid) {
    if (!uuid) {
        throw new Error('"Item.getById" must be passed one parameter');
    }

    return _
        .fetch(Url.ITEMS_BYID
            .replace(Param.UUID, uuid))
        .then(function(res) {
            return res.json();
        })
        .then(function(json) {
            return new Item(json);
        })
};

Item.prototype.update = function() {
    var self = this;
    return Item
        .getById(this.uuid)
        .then(function(newItem) {
            extend(self, newItem);
            return self
        });
}