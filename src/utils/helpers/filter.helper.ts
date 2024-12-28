// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const filterConverter = (filter: any) => {
  for (const key in filter) {
    if (
      filter[key] &&
      !isNaN(Number(filter[key])) &&
      key !== 'card_holder_id'
    ) {
      filter[key] = Number(filter[key]);
    }

    if (filter[key] && filter[key] === 'true') {
      filter[key] = true;
    }

    if (filter[key] && filter[key] === 'false') {
      filter[key] = false;
    }
  }
  return filter;
};
