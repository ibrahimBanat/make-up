const listening = PORT => {
  console.log('app is running');
  console.log(`app is listening at http://localhost:${PORT}`);
  console.log('check if your app is working by going to /proof route');
};

module.exports = {
  listening,
};
