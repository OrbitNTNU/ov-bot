# OV BOT :tobbis_rock_anthem:

Slackbot used to determine if Omega Verksted is open.

## Project Status

Live @ Heroku 🚀

## Development

### Built with

- [Javascript](https://javascript.com/)
- [bolt-js](https://github.com/slackapi/bolt-js)
- [Heroku](https://heroku.com/)
- [Axios](https://www.npmjs.com/package/axios)

### Installation

```bash
npm i
```

### Environment variables

The following environment variables need to be set:

```text
SLACK_SIGNING_SECRET
SLACK_BOT_TOKEN
APP_TOKEN
```

If you are running locally, they can be set by putting them in a `.env` file at the root of the project.

### Running locally

```bash
npm start
```

### Hosting

This project is hosted on Heroku. Heroku automatically builds and deploys whenever any changes are pushed to the `main` branch on Github.
