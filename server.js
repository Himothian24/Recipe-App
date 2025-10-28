const express = require('express');
const path = require('path');

const app = express()
const PORT = 5501

app.use(express.static('public'));

app.get('/', (req,res) => res.send('This is the home page'));

app.get('/profile', (req,res) => 
    res.sendfile(path.join(__dirname, 'public/profile.html'))
);

app.listen(PORT, () =>
    console.log('This work')
);