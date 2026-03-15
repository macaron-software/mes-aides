# SRI Hashes — Mes Aides

Subresource Integrity hashes for JS files. Regenerate after any file change.

## Generate Command

```bash
openssl dgst -sha384 -binary FILE.js | openssl base64 -A
```

## Current Hashes (2026-03-14)

```
app.js:        sha384-i++LByVomZT9PdkTO4B04hJN0/0FFo2La6GiBG7ja/6CbmA0C5x/iJgWQbv0/LZK
theme.js:      sha384-ya6Tcj4ezfcnPNXkg2Fn/wlocWMy4ebMFmYnul4Lc7OORZ5fUqSuwVNeUBX1ghDI
```

## Usage

```html
<script src="/js/app.js" integrity="sha384-i++LByVomZT9PdkTO4B04hJN0/0FFo2La6GiBG7ja/6CbmA0C5x/iJgWQbv0/LZK" crossorigin="anonymous"></script>
```

## Note

SRI is most useful when loading from CDNs. Since Mes Aides serves all files from same origin, SRI provides limited additional security but is still a defense-in-depth measure.
