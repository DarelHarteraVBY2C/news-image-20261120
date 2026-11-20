# news-image-20261120

A one-page newspaper front page summing up world news for Friday, 20 November 2026. Built for the make.fun `news-image-20261120` competition.

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
