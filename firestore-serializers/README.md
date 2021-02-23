# firestore-serializers
[![Coverage Status](https://coveralls.io/repos/github/palkerecsenyi/firestore-serializers/badge.svg?branch=master)](https://coveralls.io/github/palkerecsenyi/firestore-serializers?branch=master)
![Unit tests](https://github.com/palkerecsenyi/firestore-serializers/workflows/Unit%20tests/badge.svg)

An automatic JavaScript serialization/deserialization system for Firestore

## Features
- Simple to use – just pass a string to deserialize, or a DocumentSnapshot to serialize

- Also supports QuerySnapshot serialization and deserialization

- Can serialize/deserialize cyclical Firestore structured (i.e. DocumentReference) automatically

- Deep serialization/deserialization, including array members

- Works in-browser, in Node.js, or in any native library (e.g. React Native Firebase)

- Comes with full TypeScript type definitions

- Tested with high code coverage

## Why?
Firestore provides offline support, but it's fairly primitive: if your device doesn't have an internet connection, it uses the cached data, but otherwise it uses live data. So when you're on a slow connection, it often takes ages to query data.

A fix for this is to manually store Firestore data in your own caching system (e.g. React Native's AsyncStorage or LocalStorage in a browser). However, this often presents challenges because Firestore documents can contain non-serializable values.

This library does the heavy lifting for you, by converting special Firestore types (e.g. GeoPoint or DocumentReference) in your documents to serializable values, and vice-versa.

## Installation
```
npm install firestore-serializers
```

## Usage
```typescript
import firebase from 'firebase';
import 'firebase/firestore';
import {serializeDocumentSnapshot, serializeQuerySnapshot, deserializeDocumentSnapshot, deserializeDocumentSnapshotArray} from "firestore-serializers";

const doc = await firebase.firestore()
    .collection('my-collection')
    .doc('abc')
    .get();

const collection = await firebase.firestore()
    .collection('my-collection')
    .get();

// stringify document (returns string)
const serializedDoc = serializeDocumentSnapshot(doc);
 
// stringify query snapshot (returns string)
const serializedCollection = serializeQuerySnapshot(collection);

/*
returns DocumentSnapshot-like object
This matches the actual DocumentSnapshot class in behaviour and properties,
but is NOT an instance of the DocumentSnapshot class.
*/
deserializeDocumentSnapshot(
    serializedDoc,
    firebase.firestore(),
    firebase.firestore.GeoPoint,
    firebase.firestore.Timestamp
);

/*
returns an array of DocumentSnapshot-like objects, like the ones above.
Does NOT return a QuerySnapshot.
Think of it as returning the contents of the 'docs' property of a QuerySnapshot
*/
deserializeDocumentSnapshotArray(
    serializedCollection,
    firebase.firestore(),
    firebase.firestore.GeoPoint,
    firebase.firestore.Timestamp
);
```

## License
Licensed under the MIT license. Copyright Pal Kerecsenyi.
