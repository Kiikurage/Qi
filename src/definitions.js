var HOST = 'https://qiita.com/api/v1';

var LOCALSTORAGE_KEY = '_Qi__access_token__'

var Param = {
    USERNAME: '{{username}}',
    TAGNAME: '{{tagname}}',
    UUID: '{{uuid}}'
};

var Url = {
    AUTH: HOST + '/auth',

    USER: HOST + '/user',
    USERS: HOST + '/users/' + Param.USERNAME,
    USERS_ITEM: HOST + '/users/' + Param.USERNAME + '/items',
    USERS_STOCK: HOST + '/users/' + Param.USERNAME + '/stocks',
    USERS_FOLLOWING_USERS: HOST + '/users/' + Param.USERNAME + '/following_users',
    USERS_FOLLOWING_TAGS: HOST + '/users/' + Param.USERNAME + '/following_tags',

    TAGS: HOST + '/tags',
    TAGS_ITEMS: HOST + '/tags/' + Param.TAGNAME + '/items',

    SEARCH: HOST + '/search',

    ITEMS: HOST + '/items',
    ITEMS_BYID: HOST + '/items/' + Param.UUID,
    ITEMS_STOCK: HOST + '/items/' + Param.UUID + '/stock',

    STOCKS: HOST + '/stocks'
};

var Status = {
    NOT_AUTHORIZED: 1,
    PENDING: 2,
    AUTHORIZED: 3
};
