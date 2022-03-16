const { App } = require('@slack/bolt');
const axios = require('axios');
require('dotenv').config();

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.APP_TOKEN,
});

const omegaURL = process.env.OMEGA_URL;
const apiURL = process.env.API_URL;
const token = process.env.X_MASTER_KEY;
const chooChooURL = process.env.CHOO_CHOO_URL;

var axiosHeaders = {
  headers: {
    'Content-Type': 'application/json',
    'X-Master-Key': token,
  },
};

const addVisit = async () => {
  const currentVisits = await getVisits();

  await axios
    .put(
      apiURL,
      {
        counter: currentVisits + 1,
      },
      { axiosHeaders }
    )
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
    .get(apiURL + '/latest')
    .then((response) => {
      visits = response.data.record.counter;
    })
    .catch((error) => console.log(error));

  return visits;
};

app.message(async ({ message, say }) => {
  if (message.text === 'OV?') {
    const ovStatus = await getOvStatus();

    ovStatus ? await say('OV!') : await say(':disagreeing_astrid:');

    await addVisit();
  }
});

app.message(async ({ message, say }) => {
  if (message.text === 'OV#') {
    const visits = await getVisits();

    await respond(`OV-COUNTER: ${visits}`);
  }
});

app.command('/ov-status', async ({ ack, respond }) => {
  await ack();

  const ovStatus = await getOvStatus();

  await respond('OV er...');

  setTimeout(async () => await respond('...'), 1000);

  setTimeout(
    async () =>
      ovStatus
        ? await respond('ÅPENT :high-hk: :catrave:')
        : await respond('Stengt :disagreeing_astrid:'),
    2000
  );
});

app.command('/start-train', async ({ ack, say }) => {
  await ack();

  await say('<!channel>, OV-toget has started! :ov: :steam_locomotive:');

  setTimeout(
    async () =>
      axios.get(chooChooURL).catch((error) => {
        console.log(error);
      }),
    180000
  );
});

app.command('/help', async ({ ack, say }) => {
  await ack();

  await say(`
    Hello :wave:, available commands:
    - OV? - Answers you OV! if OV is open, if not you would know that it isn't.
    - OV# - Gives you the number of times you and the memebers of Orbit has asked to go to OV.
    - /ov-status - Tells you the state of OV.
    - /start-train - Starts OV-toget! :ov:
    - /help - Shows available commands :muscle:`);
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ OV-BOT is running!');
})();
