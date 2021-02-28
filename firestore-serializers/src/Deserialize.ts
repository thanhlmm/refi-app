import firebase from "firebase";
import { SimpleJsonType } from "./types";
import { mapDeepWithArrays } from "./map-deep-with-arrays";
import { omit } from "lodash";
import { DocRef } from "./DocRef";
import { DocumentSnapshot, QuerySnapshot } from './index.d';

function objectifyDocumentProperty(
    item: string,
    geoPoint: typeof firebase.firestore.GeoPoint,
    timestamp: typeof firebase.firestore.Timestamp,
    firestore?: (path: string) => any
): any {
    let modifiedItem: any = item;

    if (modifiedItem === null) {
        return modifiedItem;
    }

    if (item.startsWith && typeof item === 'string') {
        if (item.startsWith('__DocumentReference__')) {
            const path = item.split('__DocumentReference__')[1];
            modifiedItem = firestore ? firestore(path) : new DocRef(path);
        }

        if (item.startsWith('__Timestamp__')) {
            const dateString = item.split('__Timestamp__')[1];
            modifiedItem = timestamp.fromDate(new Date(dateString));
        }

        if (item.startsWith('__GeoPoint__')) {
            const geoSection = item.split('__GeoPoint__')[1];
            const [latitude, longitude] = geoSection.split('###');
            modifiedItem = new geoPoint(parseFloat(latitude), parseFloat(longitude));
        }
    }

    return modifiedItem;
}
function objectifyDocument(
    partialObject: {
        [key: string]: SimpleJsonType,
    },
    geoPoint: typeof firebase.firestore.GeoPoint,
    timestamp: typeof firebase.firestore.Timestamp,
    firestore?: (path: string) => any
): DocumentSnapshot {
    const mappedObject = mapDeepWithArrays(partialObject, (item: string) => {
        return objectifyDocumentProperty(item, geoPoint, timestamp, firestore);
    });
    const id = partialObject.__id__ as string;
    const path = partialObject.__path__ as string;
    const mappedObjectToInclude = omit(mappedObject, '__id__', '__path__');

    return {
        id,
        ref: new DocRef(path) as any,
        data: () => mappedObjectToInclude
    };
}

export function deserializeDocumentSnapshotArray(
    string: string,
    geoPoint: typeof firebase.firestore.GeoPoint,
    timestamp: typeof firebase.firestore.Timestamp,
    firestore?: (path: string) => any
): DocumentSnapshot[] {
    const parsedString: any[] = JSON.parse(string);
    return parsedString.map(doc => {
        return objectifyDocument(doc, geoPoint, timestamp, firestore);
    });
}

export function deserializeDocumentSnapshot(
    string: string,
    geoPoint: typeof firebase.firestore.GeoPoint,
    timestamp: typeof firebase.firestore.Timestamp,
    firestore?: (path: string) => any
): DocumentSnapshot {
    return objectifyDocument(JSON.parse(string), geoPoint, timestamp, firestore);
}
