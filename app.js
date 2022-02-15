const { App } = require('@slack/bolt');
const axios = require('axios');
require('dotenv').config();

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.APP_TOKEN,
});

const getOvStatus = async () => {
  let status = false;

  await axios
    .get('https://omegav.no/')
    .then((response) => {
      status = response.data.includes('Omega Verksted er åpent!')
        ? true
        : false;
    })
    .catch((error) => {
      console.log(error);
    });

  return status;
};

app.message(async ({ message, say }) => {
  if (message.text === 'OV?') {
    const ovStatus = getOvStatus();

    ovStatus ? await say('OV!') : await say(':disagreeing_astrid:');
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
