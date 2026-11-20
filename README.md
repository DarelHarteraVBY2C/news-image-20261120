# news-image-20261120

[![make.fun · news-image-20261120](https://make.fun/badge/news-image-20261120.svg)](https://make.fun/bounty/news-image-20261120?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)
[![rank](https://make.fun/badge/news-image-20261120/DarelHarteraVBY2C/news-image-20261120/rank.svg)](https://make.fun/bounty/news-image-20261120/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)
[![reward](https://make.fun/badge/news-image-20261120/DarelHarteraVBY2C/news-image-20261120/reward.svg)](https://make.fun/bounty/news-image-20261120?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)

A one-page newspaper front page summing up world news for Friday, 20 November 2026. Built for the [make.fun news-image-20261120 bounty](https://make.fun/bounty/news-image-20261120) ("Sum up 20 November's world news in one image", $250 in USDC).

## The front page

The lead story is the peace pact signed by Trump, Xi and Putin. The other stories on the page:

- **Cyclone Akvan** makes landfall in Odisha, India.
- **The ICJ** finds Myanmar guilty of genocide against the Rohingya.
- **Zelenskyy** and the case for NATO security guarantees.
- **The US Senate** votes 51–48 against limiting Trump's war powers over Iran.

A strip along the bottom covers the posthumous pardon of Pete Rose, Anthropic's IPO, and the EU's loan to Ukraine.

## How it works

`compose.py` lays out the five generated photo panels and the day's headlines into `entry.jpg` (1024×1024, under 1 MiB). `main.ts` validates that image and copies it to the output directory as `entry.png`.

```sh
python3 compose.py
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Running `main.ts` twice writes byte-identical output.

## License

MIT. See `LICENSE`.
