const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/validate-username', async (req, res) => {
  const { username } = req.body;
  try {
    const response = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${username}`);
    if (response.status === 200) {
      res.status(200).json({ valid: true });
    } else {
      res.status(404).json({ valid: false });
    }
  } catch (error) {
    res.status(404).json({ valid: false });
  }
});

app.listen(port, () => console.log(`Server is running on port ${port}`));