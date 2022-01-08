import express from 'express'
import * as fs from 'fs';
import {parse, evaluate} from 'groq-js'

// make sure the datastore file exists on launch
try {
    fs.statSync('./dataStore.json');
} catch (err) {
    fs.writeFileSync('./dataStore.json', '[]');
}

const dataStore = fs.readFileSync('./dataStore.json', 'utf8');

const app = express()
const port = 1337


app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})