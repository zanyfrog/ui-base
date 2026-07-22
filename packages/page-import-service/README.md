# @ui-base/page-import-service

Local rendered-page extraction service for `uib-page-importer`.

## Start

```bash
npm run start -w @ui-base/page-import-service
```

The service listens on `http://localhost:4178` by default.

## API

```http
GET /health
POST /extract
```

`POST /extract` accepts:

```json
{
  "url": "https://example.com/page",
  "waitUntil": "domcontentloaded",
  "waitForSelector": "",
  "delayMs": 1000
}
```

It returns a `PageExtractionResult` shape consumed by `@ui-base/ui-layout`.

## CLI

```bash
npm run extract -w @ui-base/page-import-service -- https://example.com/page
```
