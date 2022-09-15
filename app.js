const { App } = require('@slack/bolt');
const axios = require('axios');
require('dotenv').config();

/* It creates a new instance of the App class, and sets the signingSecret, token, socketMode and
appToken. */
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.APP_TOKEN,
});

/* Getting the environment variables from the .env file. */
const omegaURL = process.env.OMEGA_URL;
const apiURL = process.env.API_URL;
const token = process.env.X_MASTER_KEY;
const chooChooURL = process.env.CHOO_CHOO_URL;
const deployHookUrl = process.env.DEPLOY_HOOK_URL;
const delpoyChannelId = process.env.DEPLOY_CHANNEL_ID;

/* Setting the headers for the axios requests. */
var axiosHeaders = {
  headers: {
    'Content-Type': 'application/json',
    'X-Master-Key': token,
  },
};

/**
 * It gets the current number of visits from the database, adds one to it, and then updates the
 * database with the new number of visits
 */
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

/**
 * It fetches the HTML from the Omega website, and checks if the text "Omega Verksted er åpent!" is
 * present. If it is, it returns true, otherwise it returns false
 * @returns A function that returns a boolean value.
 */
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

/**
 * It makes a GET request to the API endpoint, and returns the number of visits
 * @returns The number of visits to the website.
 */
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

/* This is a function that is called when a message is sent in a channel. */
app.message(async ({ message, say }) => {
  if (message.text === 'OV?') {
    const ovStatus = await getOvStatus();

    ovStatus ? await say('OV!') : await say(':disagreeing_astrid:');

    await addVisit();
  }
});

/* This is a function that is called when a message is sent in a channel. */
app.message(async ({ message, say }) => {
  if (message.text === 'OV#') {
    const visits = await getVisits();

    await say(`OV-COUNTER: ${visits}`);
  }
});

/* A command that is used to check the status of OV. */
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

/* A command that is used to start the OV-toget. */
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

/* A command that is used to deploy our website. */
app.command('/deploy-website', async ({ ack, say, command }) => {
  await ack();

  /* This is a check to see if the command is called from the correct channel. */
  if (command.channel_id === delpoyChannelId) {
    await axios.post(deployHookUrl).catch(async (error) => {
      console.log(error);
      await say('Web deploy failed. Check the logs for more info :(');
      return false;
    });

    await say('A new website deploy has started! :muscle: :gear:');
  } else {
    await say('You cannot deploy from this channel! :angry-wilhelm:');
  }
});

/* A function that is called when the command `/help` is called. */
app.command('/help', async ({ ack, say }) => {
  await ack();

  await say(`
    Hello :wave:, available commands:
    - OV? - Answers you OV! if OV is open, if not you would know that it isn't.
    - OV# - Gives you the number of times you and the memebers of Orbit has asked to go to OV.
    - /ov-status - Tells you the state of OV.
    - /start-train - Starts OV-toget! :ov:
    - /deploy-website - Yes, the OV-Bot is used to deploy our website. :rocket:
    - /help - Shows available commands :muscle:`);
});

/* This is a function that is called when the app is started. */
(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ OV-BOT is running!');
})();
