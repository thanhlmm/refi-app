import firebase from "firebase";
import { SimpleJsonType } from "./types";
import { mapDeepWithArrays, UnmappedData } from "./map-deep-with-arrays";
import { get, isEqual, omit } from "lodash";
import { DocRef } from "./DocRef";

function objectifyDocumentProperty(
    item: string,
    geoPoint: typeof firebase.firestore.GeoPoint,
    timestamp: typeof firebase.firestore.Timestamp,
): any {
    let modifiedItem: any = item;

    if (modifiedItem === null) {
        return modifiedItem;
    }

    if (item.startsWith && typeof item === 'string') {
        if (item.startsWith('__DocumentReference__')) {
            const path = item.split('__DocumentReference__')[1];
            modifiedItem = new DocRef(path);
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

function metadataIsEqual(metadata: firebase.firestore.SnapshotMetadata): boolean {
    return metadata.fromCache && !metadata.hasPendingWrites;
}

function documentIsEqual(id: string, docA: UnmappedData, docB: firebase.firestore.DocumentSnapshot): boolean {
    return isEqual(docA, docB.data()) && id === docB.id;
}

function getField(mappedObject: UnmappedData, fieldPath: string) {
    return get(mappedObject, fieldPath);
}

function objectifyDocument(
    partialObject: {
        [key: string]: SimpleJsonType,
    },
    geoPoint: typeof firebase.firestore.GeoPoint,
    timestamp: typeof firebase.firestore.Timestamp,
): firebase.firestore.DocumentSnapshot {
    const mappedObject = mapDeepWithArrays(partialObject, (item: string) => {
        return objectifyDocumentProperty(item, geoPoint, timestamp);
    });
    const id = partialObject.__id__ as string;
    const path = partialObject.__path__ as string;
    const mappedObjectToInclude = omit(mappedObject, '__id__', '__path__');

    return {
        exists: true,
        id,
        metadata: {
            hasPendingWrites: false,
            fromCache: true,
            isEqual: metadataIsEqual
        },
        get: (fieldPath: string) => {
            return getField(mappedObjectToInclude, fieldPath);
        },
        ref: new DocRef(path) as any,
        isEqual(other: firebase.firestore.DocumentSnapshot): boolean {
            return documentIsEqual(id, mappedObjectToInclude, other);
        },
        data: () => mappedObjectToInclude
    };
}

export function deserializeDocumentSnapshotArray(
    string: string,
    geoPoint: typeof firebase.firestore.GeoPoint,
    timestamp: typeof firebase.firestore.Timestamp,
): firebase.firestore.DocumentSnapshot[] {
    const parsedString: any[] = JSON.parse(string);
    return parsedString.map(doc => {
        return objectifyDocument(doc, geoPoint, timestamp);
    });
}

export function deserializeDocumentSnapshot(
    string: string,
    geoPoint: typeof firebase.firestore.GeoPoint,
    timestamp: typeof firebase.firestore.Timestamp,
): firebase.firestore.DocumentSnapshot {
    return objectifyDocument(JSON.parse(string), geoPoint, timestamp);
}
