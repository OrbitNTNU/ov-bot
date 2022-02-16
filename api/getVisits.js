const { apiURL } = require('./common');

export const getVisits = async () => {
  let visits = 0;

  await axios
    .get(apiURL)
    .then((response) => {
      visits = Number(response.data.visits);
    })
    .catch((error) => console.log(error));

  return visits;
};
