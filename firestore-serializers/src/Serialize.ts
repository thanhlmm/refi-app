import { mapDeepWithArrays } from "./map-deep-with-arrays";
import { itemIsDocumentReference, itemIsGeoPoint, itemIsTimestamp } from "./firestore-identifiers";
import { DocumentSnapshot, QuerySnapshot } from './index.d';

function stringifyDocumentProperty(item: any): string {
    let modifiedItem: string = item;

    if (itemIsDocumentReference(item)) {
        modifiedItem = '__DocumentReference__' + item.path;
    }

    if (itemIsGeoPoint(item)) {
        modifiedItem = '__GeoPoint__' + item.latitude + '###' + item.longitude;
    }

    if (itemIsTimestamp(item)) {
        modifiedItem = '__Timestamp__' + item.toDate().toISOString();
    }

    return modifiedItem;
}

function stringifyDocument(document: DocumentSnapshot): any {
    const data = document.data();

    const dataToStringify = mapDeepWithArrays(data, stringifyDocumentProperty);
    return {
        __id__: document.id,
        __path__: document.ref.path,
        ...dataToStringify
    };
}

export function serializeQuerySnapshot(querySnapshot: QuerySnapshot): string {
    const stringifiedDocs = querySnapshot.docs.map((doc: DocumentSnapshot) => {
        return stringifyDocument(doc);
    });

    return JSON.stringify(stringifiedDocs);
}

export function serializeDocumentSnapshot(documentSnapshot: DocumentSnapshot) {
    return JSON.stringify(stringifyDocument(documentSnapshot));
}