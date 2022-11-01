const { App } = require('@slack/bolt');
const axios = require('axios');
require('dotenv').config();

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.APP_TOKEN,
});

const events = {
  halloween: new Date().getMonth() === 9 ? true : false,
  christmas: new Date().getMonth() === 11 ? true : false,
};

const quotes = {
  halloween: [
    '“It’s Halloween, everyone’s entitled to one good scare.“',
    '“I’m a mouse, duh”',
    '“Oh look, another glorious morning. Makes me sick.”',
    '“You can’t kill the boogeyman!”',
    '“I’ll stop wearing black when they make a darker colour”',
    '“I’m a ghost with the most, babe.”',
    '“When there is no room left in hell, the dead will walk the earth.”',
    '“It’s a full moon tonight. That’s when all the weirdos are out.”',
    '“I am the pumpkin king.”',
    '“It’s showtime”',
    '“Hi I’m Chucky, wanna play?”',
    '“No, please don’t kill me, Mr. Ghostface, I wanna be in the sequel.”',
    '“What an excellent day for an exorcism.”',
    '“Be afraid… Be very afraid.”',
    '“Last night you were unhinged. You were like some desperate, howling demon. You frightened me. Do it again.”',
    '“We’ve got to find Jack! There’s only 365 days left until next Halloween.”',
    '“Isn´t the view beautiful? It takes my breath away. Well, it would if I had any.”',
    '“I see dead people”',
  ],
  christmas: [
    '“You have such a pretty face. You should be on a Christmas card.”',
    '“The best way to spread Christmas cheer is singing loud for all to hear.”',
    '“I am a cotton-headed ninny muggins!”',
    '“Did I burn down the joint? I don’t think so. I was making ornaments out of fishhooks.”',
    '“Mom, does Santa Claus have to go through customs?”',
    '“Keep the change, ya filthy animal.”',
    '“You’re what the French call les incompétents.”',
    '“I wouldn’t let you sleep in my room if you were growing on my ass!”',
    '“Son of a nutcracker!”',
    '“He’s an angry elf.”',
    '“SANTA! Oh my God! Santa, here?! I know him! I know him!”',
    '“Holiday who-be what-ee?”',
    '“Am I just eating because I’m bored?”',
  ],
};

const omegaURL = process.env.OMEGA_URL;
const apiURL = process.env.API_URL;
const token = process.env.X_MASTER_KEY;
const chooChooURL = process.env.CHOO_CHOO_URL;
const deployHookUrl = process.env.DEPLOY_HOOK_URL;
const delpoyChannelId = process.env.DEPLOY_CHANNEL_ID;

const axiosHeaders = {
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
    if (events.halloween) {
      await say(
        `${
          quotes.halloween[Math.floor(Math.random() * quotes.halloween.length)]
        } 🎃👻`
      );
    } else if (events.christmas) {
      await say(
        `${
          quotes.christmas[Math.floor(Math.random() * quotes.christmas.length)]
        } 🎄🎅`
      );
    }

    await addVisit();
  }
});

app.message(async ({ message, say }) => {
  if (message.text === 'OV#') {
    const visits = await getVisits();

    await say(`OV-COUNTER: ${visits}`);
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

app.command('/deploy-website', async ({ ack, say, command }) => {
  await ack();

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

app.command('/help', async ({ ack, respond }) => {
  await ack();

  await respond(`
    Hello :wave:, available commands:
    - OV? - Answers you OV! if OV is open, if not you would know that it isn't.
    - OV# - Gives you the number of times you and the memebers of Orbit has asked to go to OV.
    - /ov-status - Tells you the state of OV.
    - /start-train - Starts OV-toget! :ov:
    - /deploy-website - Yes, the OV-Bot is used to deploy our website. :rocket:
    - /help - Shows available commands :muscle:`);
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ OV-BOT is running!');
})();
