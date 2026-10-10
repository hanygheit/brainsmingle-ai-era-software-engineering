# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Generate the PDF

The PDF is rendered by our own pipeline (no third-party service) from the unlisted `/print` page:

```sh
npx playwright install chromium   # once
node scripts/export-pdf.mjs https://brainsmingle-ai-era-software-engineering.lovable.app AI-Era-Software-Engineering_Hany-Saad_BrainsMingle-2026.pdf
```

Then open the presenter window → **Upload PDF** (needs the presenter PIN). Every Download PDF button serves that file.
