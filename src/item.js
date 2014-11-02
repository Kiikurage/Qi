function Item(data) {
    if (!(this instanceof Item)) {
        return new Item(data)
    }

    if (!(data)) {
        throw new Error('Item constructor must be called with data object.');
    }

    var localItem = Item.localItems[data.uuid];
    if (localItem) {
        localItem.updateLocal(data);
        return localItem;
    }

    Item.localItems[data.uuid] = this;
    this.updateLocal(data);
}

Item.localItems = {};

Item.prototype.updateLocal = function(data) {
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
    this.private = data.private || false;
    this.stocked = data.stocked || false;
    this.comments = data.comments ? data.comments.map(Qi.Comment) : [];

    this.created.word2 = this.created.date ? dayFormat(this.created.date) : '';
    this.updated.word2 = this.updated.date ? dayFormat(this.updated.date) : '';
}
Qi.Item = Item;

Item.prototype.stock = function() {
    var self = this;

    this.stocked = true;
    this.stockCount++;

    return _
        .fetch(Url.ITEMS_STOCK
            .replace(Param.UUID, this.uuid), {
                method: 'PUT'
            })
        .catch(function(err) {
            self.stocked = false;
            self.stockCount--;
            throw err
        })
};

Item.prototype.unstock = function() {
    var self = this;

    this.stocked = false;
    this.stockCount--;

    return _
        .fetch(Url.ITEMS_STOCK
            .replace(Param.UUID, this.uuid), {
                method: 'DELETE'
            })
        .catch(function(err) {
            self.stocked = true;
            self.stockCount++;
            throw err
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

Item.new = function() {
    return _
        .fetchWithoutToken(Url.ITEMS)
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
