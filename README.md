# Heatzy Pilote — Gladys Assistant integration

External [Gladys Assistant](https://gladysassistant.com) integration to control **Heatzy Pilote** heating modules (fil pilote): comfort, eco, frost protection, off, plus holiday/boost overrides, lock and weekly program on Pilote 2nd generation and later. Also works with Acova Elec'Pro modules.

Heatzy has no local API: the integration talks to the Heatzy cloud (Gizwits). It is **cloud only** and polls the state every 60 seconds.

User documentation: [English](docs/en.md) · [Français](docs/fr.md)

## Features

| Module generation | Gladys features |
| --- | --- |
| Pilote 1 | Mode (comfort, eco, frost, off) |
| Pilote 2 / 3 | Mode, Override (none / holiday / boost), Lock, Weekly program |
| Pilote 4 | Same as 2 / 3, plus Comfort -1 and Comfort -2 modes |

Other Heatzy products (Pilote Pro, Glow, Shine, Onyx) are ignored for now.

## Run it locally

```
npm install
GLADYS_HOST_API_URL="http://localhost:1443" \
GLADYS_INTEGRATION_TOKEN="<token>" \
GLADYS_INTEGRATION_SELECTOR="heatzy-pilote" \
LOG_LEVEL=debug \
npm start
```

Before a release, validate the manifest the way the store does:

```
npx github:GladysAssistant/integration-store .
```

## Release

**Actions → Release → Run workflow**, pick `patch`, `minor` or `major`. The workflow bumps the version (`package.json` + manifest), tags `vX.Y.Z` and publishes a multi-arch image to `ghcr.io`. The repository must be public and carry the `gladys-assistant-integration` topic, and the package must be public.

## Credits

Built on the official [Gladys JavaScript integration SDK](https://github.com/GladysAssistant/integration-sdk-js). Not affiliated with Heatzy.

## License

MIT
