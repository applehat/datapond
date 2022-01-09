# DataPond
A questionable way of storing and fetching JSON documents on the filesystem.

### Why?
I needed a persistent data storage mechanism for a small project, and had a few stipulations:

- I didn't want to spin up a database server anywhere
- I didn't want to use sqlite
- I wanted an excuse to play with `groq-js`

### What?
This is a proof of concept. It has no authentication. It's not meant to be used in production. It probably should not even be used, if we are honest with ourselves.

It (badly) replicates the concept of the Content Lake that is used by [Sanity.io](https://www.sanity.io/docs/datastore).

It is not 

## Running
`npm i`

`node main.js`