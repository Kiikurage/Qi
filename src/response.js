/**
 * サーバーからのレスポンスを表すクラス
 * @param {XMLHttpRequest} xhr 通信で使用したXMLHttpRequestオブジェクト
 * @constructor
 */
function Response(xhr) {
    this.headers = parseHeader(xhr.getAllResponseHeaders());
    this.body = xhr.responseText;
    this.xhr = xhr;
}

/**
 * レスポンスをJSONとしてパースする
 * @returns {Object} レスポンス
 */
Response.prototype.json = function () {
    return JSON.parse(this.body);
};

/**
 * ヘッダをオブジェクトに変換する
 * @param {string} text ヘッダ文字列
 * @returns {Object} 変換されたオブジェクト
 */
function parseHeader(text) {
    var val = {};

    text.split('\n').forEach(function (keyAndVal) {
        var parts = keyAndVal.split(':');

        if (parts[0] === '') {
            return
        }

        val[parts[0]] = parts[1];
    });

    return val
}
