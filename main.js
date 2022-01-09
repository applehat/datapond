import express from 'express'
import * as fs from 'fs';
import groq from 'groq-js'
import { nanoid } from 'nanoid'

// make sure the datastore file exists on launch
try {
    fs.statSync('./dataStore.json');
} catch (err) {
    // If we don't have a dataset, lets build a simple one we can query against
    const defaultData = [
      {_type: "item", _id: nanoid(), name: "Milk", description: "Whole"},
      {_type: "item", _id: nanoid(), name: "Milk", description: "2% Fat"},
      {_type: "item", _id: nanoid(), name: "Tomatoes", description: "Green cherry tomatoes"},
      {_type: "item", _id: nanoid(), name: "Tomatoes", description: "Red cherry tomatoes"},
      {_type: "other", _id: nanoid(), note: "This is a different document type"},
    ]
    fs.writeFileSync('./dataStore.json', JSON.stringify(defaultData, null, 2))
}

// trust we never make mistakes
const dataStore = JSON.parse(fs.readFileSync('./dataStore.json', 'utf8'));

/**
 * Write the dataStore to the file system
 */
const writeDataStore = () => {
  console.log(`Saving dataStore to disk`)
  try {
    fs.writeFile('./dataStore.json', JSON.stringify(dataStore, null, 2), (err)=>{
      if (err) {
        console.error(err)
      }
      console.log(`Datastore saved to disk`)
    })
  } catch (err) {
    console.log(err);
  }
}

/**
 * Create a URL friendly ID and make sure its not already in use.
 * @returns string
 */
const cleanId = () => {
  const id = nanoid()
  if (dataStore.find(item => item._id === id)) {
    // this could become a performance issue on a massive dataset...
    return cleanId()
  } else {
    return id
  }
}

const app = express()
const port = 3008 // you so 2000 and late...

app.use(express.urlencoded({ extended: true }));


app.get('/documents', async (req, res) => {
  const { query } = req.query
  if (!query) {
    res.send({error: 'Please provide a query.'})
    return
  }
  try {
    // parse the GROQ query
    const tree = groq.parse(query)
    // evaluate the query against the data set
    const value = await groq.evaluate(tree, { dataset: dataStore })
    // get the results
    const result = await value.get()
    res.send({result})
  } catch (err) {
    res.send({error: err})
  }
})

app.post('/documents', async (req, res) => {
  let id = cleanId()
  const { body } = req
  if (Object.keys(body).length === 0) {
    res.send({error: `No data was provided to create a new document.`})
    return 
  }
  if (!body._type) {
    res.send({error: `Please provide a _type for the document.`})
    return 
  }
  const newDocument = { _id: id, ...body}
  dataStore.push(newDocument)
  writeDataStore()
  res.send({success: `Document with id ${id} was created.`, document: newDocument})
})

app.patch('/documents/:id', async (req, res) => {
  const id = req.params.id
  const { body } = req
  const find = dataStore.findIndex(doc => doc._id === id)
  if (find === -1) {
    res.send({error: `No document with id ${id} was found to update.`})
    return 
  }
  if (Object.keys(body).length === 0) {
    res.send({error: `No data was provided to update the document with id ${id}.`})
    return 
  }
  // lets do the bare minimum to keep the data sane
  delete body._id // don't allow a new id to be set
  delete body._type // don't allow the type to be mutated

  const updatedDocument = {...dataStore[find], ...body}
  dataStore[find] = updatedDocument

  writeDataStore()
  res.send({success: `Document with id ${id} was updated.`, document: updatedDocument})
})

app.delete('/documents/:id', async (req, res) => {
  const id = req.params.id
  const find = dataStore.findIndex(doc => doc._id === id)
  if (find === -1) {
    res.send({error: `No document with id ${id} was found to delete.`})
    return 
  }
  dataStore.splice(find, 1)
  writeDataStore()
  res.send({success: `Document with id ${id} was deleted.`})
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})