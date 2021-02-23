import firebase from "firebase";
import {hasIn} from "lodash";

export function itemIsDocumentReference(item: any): item is firebase.firestore.DocumentReference {
    return [
        hasIn(item, 'id'),
        hasIn(item, 'parent'),
        hasIn(item, 'path'),
        hasIn(item, 'get'),
    ].every(e => e === true);
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