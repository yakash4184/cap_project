export const isAuthorizedCronRequest = (authorizationHeader) => {
  if (!process.env.CRON_SECRET) {
    return false;
  }

  return authorizationHeader === `Bearer ${process.env.CRON_SECRET}`;
};
