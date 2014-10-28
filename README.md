#Qi.js

Qiita API のJavascript向けラッパーライブラリ(開発中)

v0.0

##インストール

```bash
bower install Qi
```

##使用方法

```html
<script src="./Qi.js"></script>
```

詳しい使い方はWikiを参照(未着手)

##対応状況と課題

- Qiita API v1.0のみ対応
- `POST /api/v1/items`,`PUT /api/v1/items/:uuid`に未対応
- ページングに未対応(下記「問題点」を参照)
- ドキュメント整備

##問題点

- Qiita API v2.0 は全体的にAccess-Control-Allow-Originが指定されておらず、ブラウザからのアクセスは不可能
- ページングを行うにはレスポンスのLinkヘッダを参照する必要があるが、`Access-Control-Expose-Headers:Link`がレスポンスに設定されておらず、アクセス出来ない。
