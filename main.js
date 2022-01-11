import express from 'express'
import * as fs from 'fs'
import groq from 'groq-js'
import {nanoid} from 'nanoid'
import cors from 'cors'

// make sure the datastore file exists on launch
try {
  fs.statSync('./dataStore.json')
} catch (err) {
  // If we don't have a dataset, lets build a simple one we can query against
  const defaultData = [
    {_type: 'item', _id: nanoid(), name: 'Milk', description: 'Whole', count: 1, complete: false},
    {_type: 'item', _id: nanoid(), name: 'Milk', description: '2% Fat', count: 2, complete: true},
    {_type: 'item', _id: nanoid(), name: 'Tomatoes', description: 'Green cherry tomatoes', count: 1, complete: false},
    {_type: 'item', _id: nanoid(), name: 'Tomatoes', description: 'Red cherry tomatoes', count: 4, complete: false},
    {_type: 'other', _id: nanoid(), note: 'This is a different document type'},
  ]
  fs.writeFileSync('./dataStore.json', JSON.stringify(defaultData, null, 2))
}

// trust we never make mistakes
const dataStore = JSON.parse(fs.readFileSync('./dataStore.json', 'utf8'))

/**
 * Write the dataStore to the file system
 */
const writeDataStore = () => {
  console.log(`Saving dataStore to disk`)
  try {
    fs.writeFile('./dataStore.json', JSON.stringify(dataStore, null, 2), (err) => {
      if (err) {
        console.error(err)
      }
      console.log(`Datastore saved to disk`)
    })
  } catch (err) {
    console.log(err)
  }
}

/**
 * Create a URL friendly ID and make sure its not already in use.
 * @return {string}
 */
const cleanId = () => {
  const id = nanoid()
  if (dataStore.find((item) => item._id === id)) {
    // this could become a performance issue on a massive dataset...
    return cleanId()
  } else {
    return id
  }
}

const app = express()
const port = 3008 // you so 2000 and late...

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const parseQuery = async (query) => {
  try {
    // parse the GROQ query
    const tree = groq.parse(query)
    // evaluate the query against the data set
    const value = await groq.evaluate(tree, {dataset: dataStore})
    // get the results
    const result = await value.get()
    return result
  } catch (err) {
    console.error(err)
    return {error: err}
  }
}

app.get('/query', async (req, res) => {
  const query = req.query.query
  if (!query) {
    res.status(400).send({error: 'No query provided'})
    return
  }
  console.log(`Query Made: ${query}`)
  // We have a query. Just parse it and respond
  const result = await parseQuery(query)
  if (result.error) {
    res.send({error: result.error})
    return
  }
  res.send({result})

})

app.get('/documents', async (req, res) => {
  console.log('Request for documents made')
  let query = ""
  const type = req.query.type || 'item'
  const base = `*[_type=="${type}"]`
  let response = {}

  // Determine total documents
  const total = await parseQuery(`count(${base})`)
  response.total = total

  if (req.query.page) {

    const perPage = parseInt(req.query.perPage) || 10
    const page = parseInt(req.query.page) || 1
    const start = (page - 1) * perPage
    const end = start + perPage - 1
    // Build the query
    query = `${base}[${start}..${end}]`
    console.log(page, perPage, start, end, query)
    response = {page, perPage, query, ...response}
  } else {
    query = `${base}`
  }
  
  const result = await parseQuery(query)
  if (result.error) {
    res.send({error: err})
    return
  }
  response.result = result;
  res.send(response)
})

app.post('/documents', async (req, res) => {
  console.log('New document creation called')
  const id = cleanId()
  const {body} = req
  if (Object.keys(body).length === 0) {
    res.send({error: `No data was provided to create a new document.`})
    return
  }
  if (!body._type) {
    res.send({error: `Please provide a _type for the document.`})
    return
  }
  const newDocument = {...body, _id: id}
  dataStore.push(newDocument)
  writeDataStore()
  res.send({success: `Document with id ${id} was created.`, document: newDocument})
})

app.patch('/documents/:id', async (req, res) => {
  console.log('Document update called')
  const id = req.params.id
  const {body} = req
  const find = dataStore.findIndex((doc) => doc._id === id)
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
  console.log('Document deletion called')
  const id = req.params.id
  const find = dataStore.findIndex((doc) => doc._id === id)
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
