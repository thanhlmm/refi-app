import firebase from 'firebase';
import {mapDeepWithArrays} from "./map-deep-with-arrays";
import {itemIsDocumentReference, itemIsGeoPoint, itemIsTimestamp} from "./firestore-identifiers";

function stringifyDocumentProperty(item: any): string {
    let modifiedItem: string = item;

    if(itemIsDocumentReference(item)) {
        modifiedItem = '__DocumentReference__' + item.path;
    }

    if(itemIsGeoPoint(item)) {
        modifiedItem = '__GeoPoint__' + item.latitude + '###' + item.longitude;
    }

    if(itemIsTimestamp(item)) {
        modifiedItem = '__Timestamp__' + item.toDate().toISOString();
    }

    return modifiedItem;
}

function stringifyDocument(document: firebase.firestore.DocumentSnapshot): any {
    const data = document.data();

    const dataToStringify = mapDeepWithArrays(data, stringifyDocumentProperty);
    return {
        __id__: document.id,
        __path__: document.ref.path,
        ...dataToStringify
    };
}

export function serializeQuerySnapshot(querySnapshot: firebase.firestore.QuerySnapshot): string {
    const stringifiedDocs = querySnapshot.docs.map((doc: firebase.firestore.DocumentSnapshot) => {
        return stringifyDocument(doc);
    });

    return JSON.stringify(stringifiedDocs);
}

export function serializeDocumentSnapshot(documentSnapshot: firebase.firestore.DocumentSnapshot) {
    return JSON.stringify(stringifyDocument(documentSnapshot));
}