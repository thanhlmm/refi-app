import { beforeAll, describe, expect, it } from "bun:test";
import admin from "firebase-admin";
import { deserializeDocumentSnapshot, deserializeDocumentSnapshotArray } from "./Deserialize";
import { serializeDocumentSnapshot, serializeQuerySnapshot } from "./Serialize";

const { GeoPoint, Timestamp } = admin.firestore;

process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";

let db: admin.firestore.Firestore;

beforeAll(() => {
    const app = admin.initializeApp({ projectId: "demo-refi" });
    db = app.firestore();
});

function buildData(target: admin.firestore.DocumentReference) {
    return {
        time: Timestamp.fromMillis(1609459200123),
        place: { point: new GeoPoint(-12.5, -0.25) },
        refs: [target, { inner: target }],
        plain: { path: "a/b", n: 1 },
    };
}

function expectSameData(actual: any, expected: ReturnType<typeof buildData>) {
    expect(actual.time.isEqual(expected.time)).toBe(true);
    expect(actual.place.point.isEqual(expected.place.point)).toBe(true);
    expect(actual.refs[0].isEqual(expected.refs[0])).toBe(true);
    expect(actual.refs[1].inner.isEqual(expected.refs[0])).toBe(true);
    expect(actual.plain).toEqual(expected.plain);
}

function deserializeLikeServer(json: string) {
    return deserializeDocumentSnapshot(json, GeoPoint as any, Timestamp as any, (path) => db.doc(path));
}

describe("firebase-admin values on the emulator", () => {
    it("survives serialize and deserialize after a read", async () => {
        const target = db.doc("readTarget/t1");
        const original = buildData(target);
        const ref = db.collection("readPath").doc("d1");
        await ref.set(original);

        const json = serializeDocumentSnapshot(await ref.get());
        const result = deserializeLikeServer(json).data();

        expectSameData(result, original);
    });

    it("saves deserialized data back unchanged", async () => {
        const target = db.doc("saveTarget/t1");
        const original = buildData(target);
        const source = db.collection("savePath").doc("source");
        await source.set(original);

        const json = serializeDocumentSnapshot(await source.get());
        const copy = db.collection("savePath").doc("copy");
        await copy.set(deserializeLikeServer(json).data()!);

        expectSameData((await copy.get()).data(), original);
    });

    it("keeps every document of a query snapshot in query order", async () => {
        const collection = db.collection("queryPath");
        const target = db.doc("queryTarget/t1");
        for (const n of [3, 1, 2]) {
            await collection.doc(`d${n}`).set({ ...buildData(target), n });
        }

        const json = serializeQuerySnapshot(await collection.orderBy("n").get());
        const docs = deserializeDocumentSnapshotArray(json, GeoPoint as any, Timestamp as any, (path) => db.doc(path));

        expect(docs.map((doc) => doc.id)).toEqual(["d1", "d2", "d3"]);
        expect(docs.map((doc) => (doc.data() as any).n)).toEqual([1, 2, 3]);
    });
});
