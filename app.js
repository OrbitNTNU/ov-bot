const { App } = require('@slack/bolt');
const axios = require('axios');
require('dotenv').config();

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.APP_TOKEN,
});

const omegaURL = 'https://omegav.no/';
const apiURL = 'https://api.jsonbin.io/b/620c15c64bf50f4b2dfcfa7c';

const addVisit = async () => {
  const currentVisits = await getVisits();

  await axios
    .put(apiURL, {
      visits: 100,
    })
    .then((response) => console.log(response))
    .catch((error) => console.log(error));
};

const getOvStatus = async () => {
  let status = false;

  await axios
    .get(omegaURL)
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

const getVisits = async () => {
  let visits = 0;

  await axios
    .get(apiURL)
    .then((response) => {
      visits = Number(response.data.visits);
    })
    .catch((error) => console.log(error));

  return visits;
};

app.message(async ({ message, say }) => {
  if (message.text === 'OV?') {
    const ovStatus = getOvStatus();

    ovStatus ? await say('OV! <!channel>') : await say(':disagreeing_astrid:');

    // await addVisit();
  }
});

app.message(async ({ message, say }) => {
  if (message.text === 'OV#') {
    const visits = await getVisits();

    await say('TODO: Implement this function :oldschool_sad: ');
  }
});

app.command('/ov-status', async ({ ack, say }) => {
  await ack();

  const ovStatus = getOvStatus();

  await say('OV er...');

  setTimeout(async () => await say('...'), 1000);

  setTimeout(
    async () =>
      ovStatus
        ? await say('ÅPENT :high-hk: :catrave:')
        : await say('Stengt :disagreeing_astrid:'),
    2000
  );
});

app.command('/help', async ({ ack, say }) => {
  await ack();

  await say(`
    Hello you stupid fuck, here are some help! :bossgirl_mari:
    - OV? - Answers you OV! if OV is open, if not you would know that it isn't.
    - OV# - Gives you the number of times you and the memebers of Orbit has asked to go to OV.
    - /ov-status - Tells you the state of OV.
    - /help - I hope you know what this does :disagreeing_astrid:`);
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ OV-BOT is running!');
})();
