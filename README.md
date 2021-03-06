# DataPond💦
A questionable way of storing and fetching JSON documents on the filesystem.

### Why?
I needed a persistent data storage mechanism for a small project, and had a few stipulations:

- I didn't want to spin up a database server anywhere
- I didn't want to use sqlite
- I wanted an excuse to play with `groq-js`

### What?
This is a proof of concept. It has no authentication. It's not meant to be used in production. It probably should not even be used, if we are honest with ourselves. (See [Notes](#notes))

It (badly) replicates the concept of the Content Lake that is used by [Sanity.io](https://www.sanity.io/docs/datastore).

# Endpoints🔌

For slightly better documentation, and a nice way of testing, you can import `postman.json` into Postman and use the collection.

## [GET] `/query`
Request documents from the DataPond using GROQ queries.

|Param|Example|Description|
|---|---|---|
|query|`*[_type=="item"][0..5]{name}`|A GROQ Query|

## [GET] `/documents`
Request documents from the DataPond.

|Param|Example|Description|
|---|---|---|
|type|`item`|The type of document to request. Defaults to `item`|
|page|`1`|The page of items you want.|
|perPage|`10`|The number of items you want per page. Defaults to `10`. Only works if page is explicitly set.|

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

# Known Issues👷

- Currently there is no way to limit the fields retrieved from documents using the `/documents` endpoint. You can use `/query` if you need more advanced filtering.

# Running💻
`npm i`

`npm start`

# Notes📃
Please don't use this. 

There are infinitely better options -- this was just a quick (and kinda dirty) backend exclusively written to fufill my own desires to do something with `groq-js`.

The code is not great. 

This is not best practices.

This is not even great API design.

Just, don't use this.