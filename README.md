# Pomodoro

[![build](https://github.com/remarkablemark/pomodoro/actions/workflows/build.yml/badge.svg)](https://github.com/remarkablemark/pomodoro/actions/workflows/build.yml)
[![test](https://github.com/remarkablemark/pomodoro/actions/workflows/test.yml/badge.svg)](https://github.com/remarkablemark/pomodoro/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/remarkablemark/pomodoro/graph/badge.svg?token=ufL1wUHQ5F)](https://codecov.io/gh/remarkablemark/pomodoro)

⏲️ A Pomodoro timer:

- [Demo](https://remarkablemark.org/pomodoro/)

## Features

- 25/5/15 minute Pomodoro timer (15m long break after every 4 work sessions)
- Circular progress ring with session color coding
- Start, Pause, Reset, and Skip controls
- Spacebar keyboard shortcut to start/pause
- Audio beep and browser notification on completion
- Dark mode support

## Install

Clone the repository:

```sh
git clone https://github.com/remarkablemark/pomodoro.git
cd pomodoro
```

Install the dependencies:

```sh
npm install
```

## Run

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) to view it in the browser.

The page will reload if you make edits.

You will also see any errors in the console.

### `npm run build`

Builds the app for production to the `dist` folder.

It correctly bundles in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

Your app is ready to be deployed!

### `npm run lint`

Checks code quality.

### `npm run lint:fix`

Runs ESLint and fixes auto-fixable issues.

### `npm run lint:tsc`

Checks for type errors.

### `npm test`

Runs tests.

### `npm run test:ci`

Runs tests with coverage.

## License

[MIT](LICENSE)
