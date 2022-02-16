const { apiURL } = require('./common');
const { getVisits } = require('./getVisits');

export const addVisit = async () => {
  const currentVisits = await getVisits();

  await axios
    .put(apiURL, {
      visits: 100,
    })
    .then((response) => console.log(response))
    .catch((error) => console.log(error));
};
