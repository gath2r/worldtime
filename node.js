const express = require('express');
const app = express();

app.get('/', function (req, res) {
  const userAgent = req.headers['user-agent'];

  if (/mobile/i.test(userAgent)) {
    res.sendFile(__dirname + '/weather-mobile.html');
  } else {
    res.sendFile(__dirname + '/weather.html');
  }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
