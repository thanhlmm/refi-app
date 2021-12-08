import firebase from "firebase";

type DocumentData = { [field: string]: any };
declare class IDocRef {
    public path: string;
    public constructor(path: string);
}
declare class DocumentSnapshot<T = DocumentData> {
    readonly ref: IDocRef
    readonly id: string;
    data(): T | undefined;
}

declare class QuerySnapshot<T = DocumentSnapshot> {
    readonly docs: Array<T>;
}

declare function serializeDocumentSnapshot(
    documentSnapshot: DocumentSnapshot
): string;

declare function serializeQuerySnapshot(
    querySnapshot: QuerySnapshot
): string;

declare function deserializeDocumentSnapshot<
    T = DocumentData
>(
    input: string,
    geoPoint: typeof firebase.firestore.GeoPoint,
    timestamp: typeof firebase.firestore.Timestamp,
    firestore?: (path: string) => any
): DocumentSnapshot<T>;

declare function deserializeDocumentSnapshotArray<
    T = DocumentData
>(
    input: string,
    geoPoint: typeof firebase.firestore.GeoPoint,
    timestamp: typeof firebase.firestore.Timestamp,
    firestore?: (path: string) => any
): DocumentSnapshot<T>[];


declare function itemIsInternalDocumentReference(item: any): item is IDocRef

declare function itemIsFSDocumentReference(item: any): item is firebase.firestore.DocumentReference

declare function itemIsDocumentReference(item: any): item is firebase.firestore.DocumentReference | IDocRef

declare function itemIsGeoPoint(item: any): item is firebase.firestore.GeoPoint

declare function itemIsTimestamp(item: any): item is firebase.firestore.Timestamp

declare class DocRef {
    public path: string;
    public constructor(path: string);
}