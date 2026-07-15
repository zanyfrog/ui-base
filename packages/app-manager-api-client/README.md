# @ui.base/app-manager-api-client

Small fetch wrapper for the local ORM and I-AM endpoints used by the app manager UI components.

It sends the dev-friendly identity headers:

```text
X-Actor-Id: original-creator
Authorization: Bearer dev-token
```


## Detail icon upload

Use `client.uploadDetailIcon(file, { applicationKey, heroKey, detailIndex })` to upload an image to the ORM service. Save the returned `iconUrl` into the matching `application_hero.details[]` item.
