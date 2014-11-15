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