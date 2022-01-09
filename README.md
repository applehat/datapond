# DataPond💦
A questionable way of storing and fetching JSON documents on the filesystem.

### Why?
I needed a persistent data storage mechanism for a small project, and had a few stipulations:

- I didn't want to spin up a database server anywhere
- I didn't want to use sqlite
- I wanted an excuse to play with `groq-js`

### What?
This is a proof of concept. It has no authentication. It's not meant to be used in production. It probably should not even be used, if we are honest with 

It (badly) replicates the concept of the Content Lake that is used by [Sanity.io](https://www.sanity.io/docs/datastore).

# Endpoints

For slightly better documentation, and a nice way of testing, you can import `postman.json` into Postman and use the collection.

## [GET] `/documents`
Request documents from the DataPond using GROQ queries.


|Param|Example|Description|
|---|---|---|
|query|*[_type=="item"]|A GROQ Query|

## [POST] `/documents`

Create a new document in the DataPond.

Expects `x-www-form-urlencoded` data.

Requires that a `_type` property be given. Created its own `_id` property, and will ignore any `_id` passed to it.

## [PATCH] `/documents/:id`

Update an existing document in the DataPond

Based on `id` passed in URL, will update the document with anything passed in the body.
Expects `x-www-form-urlencoded` data.

Note: Does not allow `_type` or `_id` to be mutated.

## [DELETE] `/documents/:id`
Delete a document from the DataPond by id

Will delete the document with the given `id` if it exists.
# Running
`npm i`

`node main.js`