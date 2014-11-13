_.get = function(url, param, headers) {
    if (param) {
        url += '?' + encodeURIParam(param);
    }
    return ajax('GET', url, headers, null)

};

_.post = function(url, param, headers) {
    return ajax('POST', url, extend({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }, headers), JSON.stringify(param))
};

_.put = function(url, param, headers) {
    return ajax('PUT', url, extend({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }, headers), JSON.stringify(param))
};

_.patch = function(url, param, headers) {
    return ajax('PATCH', url, extend({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }, headers), JSON.stringify(param))
};

_.delete = function(url, param, headers) {
    return ajax('DELETE', url, headers, null)
};

function ajax(method, url, headers, body) {
    var xhr = new XMLHttpRequest(),
        defer = Promise.defer();

    xhr.open(method, url, true);

    if (headers) {
        Object.keys(headers).forEach(function(key) {
            xhr.setRequestHeader(key, headers[key]);
        });
    }

    xhr.addEventListener('load', function() {
        defer.resolve(new Response(xhr.responseText));
    });
    xhr.addEventListener('error', function() {
        defer.reject(xhr);
    });

    xhr.send(body);

    return defer.promise
}

function encodeURIParam(obj) {
    var parts = [];
    Object.keys(obj).forEach(function(key) {
        parts.push(key + '=' + encodeURIComponent(obj[key]));
    });
    return parts.join('&')
};

function extend(to, opt_srces) {
    var srces = Array.prototype.slice.call(arguments, 1);

    srces.forEach(function(src) {
        if (!src) {
            return
        }

        Object.keys(src).forEach(function(key) {
            to[key] = src[key];
        });
    });

    return to
};

function Response(val) {
    this.value = val;
}

Response.prototype.json = function() {
    return JSON.parse(this.value);
};
