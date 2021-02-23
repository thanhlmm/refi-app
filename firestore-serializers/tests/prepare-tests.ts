import firebase from "firebase";
import 'firebase/firestore';

firebase.initializeApp({
    apiKey: "AIzaSyA-LcxEpTeXYgKSLziNQYMV3s1-LeU-mrc",
    databaseURL: "https://firestore-serializer.firebaseio.com",
    projectId: "firestore-serializer",
    appId: "1:713937975677:web:20bc5eb2de1cf56fd63414"
});

export async function initFirebase() {
    /**
     * Guide to changing these documents to add/modify tests:
     *
     * - The IDs specified here refer to document IDs.
     * These can be referenced using `firebase.firestore().collection('documents').doc(ID)` during any test
     *
     * - These documents are re-created between every test
     *
     * - Please note that the tests depend on the contents of these documents.
     * Make sure to update all tests to reflect any content changes you make
     *
     * - Some tests may rely on the amount of documents, so make sure the update those too
     */
    const documents = [
        { id: 'simple', a: 'b' },
        { id: 'timestamp', a: firebase.firestore.Timestamp.fromDate(new Date()) },
        { id: 'geopoint', a: new firebase.firestore.GeoPoint(10, 10) },
        { id: 'geopoint-with-float', a: new firebase.firestore.GeoPoint(2.3294, 34.224) },
        { id: 'geopoint-with-negative-float', a: new firebase.firestore.GeoPoint(2.314, -32.443) },
        { id: 'document-reference', a: firebase.firestore().collection('documents').doc('simple') },
        {
            id: 'multiple',
            a: 'b',
            b: firebase.firestore.Timestamp.fromDate(new Date()),
            c: new firebase.firestore.GeoPoint(4.3234, -2.234),
            d: firebase.firestore().collection('documents').doc('simple')
        },
        {
            id: 'nested',
            a: 'b',
            b: {
                c: firebase.firestore.Timestamp.fromDate(new Date()),
                d: {
                    e: [
                        new firebase.firestore.GeoPoint(3.43, -3.445),
                        firebase.firestore().collection('documents').doc('simple')
                    ]
                }
            }
        }
    ];

    const batch = firebase.firestore().batch();

    documents.forEach(e => {
        batch.set(
            firebase.firestore().collection('documents').doc(e.id),
            e
        );
    });

    await batch.commit();
}

export enum DeserializationTestString {
    Simple = 0,
    Timestamp = 1,
    GeoPoint = 2,
    GeoPointFloat = 3,
    GeoPointFloatNegative = 4,
    DocumentReference = 5,
    Multiple = 6,
    Nested = 7,
    Query = 8
}

export function getDeserializationTestString(type: DeserializationTestString) {
    switch (type) {
        case DeserializationTestString.Simple:
            return '{"__id__":"simple","__path__":"documents/simple","a":"b","id":"simple"}';
        case DeserializationTestString.Timestamp:
            return '{"__id__":"timestamp","__path__":"documents/timestamp","a":"__Timestamp__2020-04-19T12:31:15.360Z","id":"timestamp"}';
        case DeserializationTestString.GeoPoint:
            return '{"__id__":"geopoint","__path__":"documents/geopoint","id":"geopoint","a":"__GeoPoint__10###10"}';
        case DeserializationTestString.GeoPointFloat:
            return '{"__id__":"geopoint-with-float","__path__":"documents/geopoint-with-float","a":"__GeoPoint__2.3294###34.224","id":"geopoint-with-float"}';
        case DeserializationTestString.GeoPointFloatNegative:
            return '{"__id__":"geopoint-with-negative-float","__path__":"documents/geopoint-with-negative-float","a":"__GeoPoint__2.314###-32.443","id":"geopoint-with-negative-float"}';
        case DeserializationTestString.DocumentReference:
            return '{"__id__":"document-reference","__path__":"documents/document-reference","a":"__DocumentReference__documents/simple","id":"document-reference"}';
        case DeserializationTestString.Multiple:
            return '{"__id__":"multiple","__path__":"documents/multiple","a":"b","b":"__Timestamp__2020-04-19T15:17:33.856Z","id":"multiple","d":"__DocumentReference__documents/simple","c":"__GeoPoint__4.3234###-2.234"}';
        case DeserializationTestString.Nested:
            return '{"__id__":"nested","__path__":"documents/nested","a":"b","b":{"d":{"e":["__GeoPoint__3.43###-3.445","__DocumentReference__documents/simple"]},"c":"__Timestamp__2020-04-19T15:21:09.935Z"},"id":"nested"}';
        case DeserializationTestString.Query:
            return '[{"__id__":"document-reference","__path__":"documents/document-reference","a":"__DocumentReference__documents/simple","id":"document-reference"},{"__id__":"geopoint","__path__":"documents/geopoint","id":"geopoint","a":"__GeoPoint__10###10"},{"__id__":"geopoint-with-float","__path__":"documents/geopoint-with-float","id":"geopoint-with-float","a":"__GeoPoint__2.3294###34.224"},{"__id__":"geopoint-with-negative-float","__path__":"documents/geopoint-with-negative-float","id":"geopoint-with-negative-float","a":"__GeoPoint__2.314###-32.443"},{"__id__":"multiple","__path__":"documents/multiple","c":"__GeoPoint__4.3234###-2.234","a":"b","b":"__Timestamp__2020-04-19T15:26:09.761Z","id":"multiple","d":"__DocumentReference__documents/simple"},{"__id__":"nested","__path__":"documents/nested","a":"b","b":{"c":"__Timestamp__2020-04-19T15:26:09.761Z","d":{"e":["__GeoPoint__3.43###-3.445","__DocumentReference__documents/simple"]}},"id":"nested"},{"__id__":"simple","__path__":"documents/simple","id":"simple","a":"b"},{"__id__":"timestamp","__path__":"documents/timestamp","a":"__Timestamp__2020-04-19T15:26:09.760Z","id":"timestamp"}]';
    }
}