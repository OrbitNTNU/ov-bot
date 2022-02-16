import { omegaURL } from './common';

export const getOvStatus = async () => {
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
