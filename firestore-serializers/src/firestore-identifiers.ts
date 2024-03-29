import firebase from "firebase";
import { hasIn } from "lodash";
import { DocRef } from "./DocRef";

export function itemIsInternalDocumentReference(item: any): item is DocRef {
    return [
        hasIn(item, 'path'),
    ].every(e => e === true);
}

export function itemIsFSDocumentReference(item: any): item is firebase.firestore.DocumentReference {
    return [
        hasIn(item, 'id'),
        hasIn(item, 'parent'),
        hasIn(item, 'path'),
        hasIn(item, 'get'),
    ].every(e => e === true);
}

export function itemIsDocumentReference(item: any): item is firebase.firestore.DocumentReference | DocRef {
    return itemIsInternalDocumentReference(item) || itemIsFSDocumentReference(item);
}

export function itemIsGeoPoint(item: any): item is firebase.firestore.GeoPoint {
    return [
        hasIn(item, 'latitude'),
        hasIn(item, 'longitude')
    ].every(e => e === true);
}

export function itemIsTimestamp(item: any): item is firebase.firestore.Timestamp {
    return [
        hasIn(item, 'seconds'),
        hasIn(item, 'nanoseconds'),
        hasIn(item, 'toDate')
    ].every(e => e === true)
}