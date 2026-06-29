# Contributing to POWR Terminal

Thanks for your interest in contributing. This is a small project, so guidelines are light.

## Bugs and Feature Requests

Open a [GitHub Issue](https://github.com/skinnerboxentertainment/powr-terminal-tictactoe/issues) with a clear description of the bug or the feature you'd like to see.

## Pull Requests

PRs are welcome for:

- **Bug fixes** — something is broken, here's the fix
- **Playwright test improvements** — the browser test suite
- **Accessibility improvements** — keyboard navigation, screen reader support, colorblind modes

PRs that add large new features without discussion are likely to be closed. Open an issue first to discuss the direction.

## Development Setup

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest
npm run build      # tsc + vite build
```

## Code Style

- TypeScript strict mode — no `any`
- PixiJS v8 API — check `.opencode/docs/pixijs-reference/VERSION.md`
- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`
- Tests use Vitest with Arrange/Act/Assert structure

## Commit Format

```
feat: add touch input support for mobile
fix: correct game-over overlay position on narrow screens
docs: update README with keyboard shortcuts
```

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
