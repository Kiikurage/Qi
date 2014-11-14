function Response(xhr) {
    this.headers = parseHeader(xhr.getAllResponseHeaders());
    this.body = xhr.responseText;
    this.xhr = xhr;
}

Response.prototype.json = function () {
    return JSON.parse(this.body);
};

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
