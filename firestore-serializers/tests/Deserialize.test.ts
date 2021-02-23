import {DeserializationTestString, getDeserializationTestString} from "./prepare-tests";
import {deserializeDocumentSnapshot, deserializeDocumentSnapshotArray} from "../src";
import firebase from "firebase";
import chai from 'chai';
import { cloneDeep } from "lodash";

chai.should();

const basicDeserializedDocumentSnapshotTests = (deserializedDocumentSnapshot: firebase.firestore.DocumentSnapshot, expectedId: string) => {
    deserializedDocumentSnapshot.should.be.an('object');
    deserializedDocumentSnapshot.data().should.not.have.property('__id__');
    deserializedDocumentSnapshot.data().should.not.have.property('__path__');
    deserializedDocumentSnapshot.should.have.property('id', expectedId);
    deserializedDocumentSnapshot.ref.should.have.property('id', expectedId);

    deserializedDocumentSnapshot.metadata.isEqual({
        fromCache: true,
        hasPendingWrites: false,
        isEqual(): boolean {
            return false;
        }
    }).should.be.true;

    deserializedDocumentSnapshot.get('id').should.equal(expectedId);

    const clonedDocumentSnapshot = cloneDeep(deserializedDocumentSnapshot);
    deserializedDocumentSnapshot.isEqual(clonedDocumentSnapshot).should.be.true;
    // @ts-ignore
    deserializedDocumentSnapshot.isEqual({
        data() {
            return null;
        }
    }).should.be.false;
}

const firestore = firebase.firestore();

describe('Deserialize', () => {

    describe('Simple documents', () => {
        it('should deserialize a simple document', async () => {
            const stringToDeserialize = getDeserializationTestString(DeserializationTestString.Simple);
            const deserializedDocumentSnapshot = deserializeDocumentSnapshot(
                stringToDeserialize,
                firestore,
                firebase.firestore.GeoPoint,
                firebase.firestore.Timestamp
            );

            basicDeserializedDocumentSnapshotTests(deserializedDocumentSnapshot, 'simple');
            deserializedDocumentSnapshot.data().should.have.property('a', 'b');
        });
    });

    describe('Documents with Timestamps', () => {
        it('should deserialize a document containing a Timestamp', async () => {
            const stringToDeserialize = getDeserializationTestString(DeserializationTestString.Timestamp);
            const deserializedDocumentSnapshot = deserializeDocumentSnapshot(
                stringToDeserialize,
                firestore,
                firebase.firestore.GeoPoint,
                firebase.firestore.Timestamp
            );
            basicDeserializedDocumentSnapshotTests(deserializedDocumentSnapshot, 'timestamp');
            deserializedDocumentSnapshot.data().should.have.property('a')
            deserializedDocumentSnapshot.data().a.should.have.property('toDate');
        });
    });

    describe('Documents with GeoPoints', () => {
        it('should deserialize a document containing a simple GeoPoint', async () => {
            const stringToDeserialize = getDeserializationTestString(DeserializationTestString.GeoPoint);
            const deserializedDocumentSnapshot = deserializeDocumentSnapshot(
                stringToDeserialize,
                firestore,
                firebase.firestore.GeoPoint,
                firebase.firestore.Timestamp
            );
            basicDeserializedDocumentSnapshotTests(deserializedDocumentSnapshot, 'geopoint');
            deserializedDocumentSnapshot.data().should.have.property('a');
            deserializedDocumentSnapshot.data().a.should.have.property('latitude', 10);
            deserializedDocumentSnapshot.data().a.should.have.property('longitude', 10);
            deserializedDocumentSnapshot.data().a.should.have.property('isEqual');
        });

        it('should deserialize a document containing a GeoPoint with floats', async () => {
            const stringToDeserialize = getDeserializationTestString(DeserializationTestString.GeoPointFloat);
            const deserializedDocumentSnapshot = deserializeDocumentSnapshot(
                stringToDeserialize,
                firestore,
                firebase.firestore.GeoPoint,
                firebase.firestore.Timestamp
            );
            basicDeserializedDocumentSnapshotTests(deserializedDocumentSnapshot, 'geopoint-with-float');
            deserializedDocumentSnapshot.data().should.have.property('a');
            deserializedDocumentSnapshot.data().a.should.have.property('latitude', 2.3294);
            deserializedDocumentSnapshot.data().a.should.have.property('longitude', 34.224);
        });

        it('should deserialize a document containing a GeoPoint with negative floats', async () => {
            const stringToDeserialize = getDeserializationTestString(DeserializationTestString.GeoPointFloatNegative);
            const deserializedDocumentSnapshot = deserializeDocumentSnapshot(
                stringToDeserialize,
                firestore,
                firebase.firestore.GeoPoint,
                firebase.firestore.Timestamp
            );
            basicDeserializedDocumentSnapshotTests(deserializedDocumentSnapshot, 'geopoint-with-negative-float');
            deserializedDocumentSnapshot.data().should.have.property('a');
            deserializedDocumentSnapshot.data().a.should.have.property('latitude', 2.314);
            deserializedDocumentSnapshot.data().a.should.have.property('longitude', -32.443);
        });
    });

    describe('Documents with DocumentReferences', () => {
        it('should deserialize a document containing a DocumentReference', async () => {
            const stringToDeserialize = getDeserializationTestString(DeserializationTestString.DocumentReference);
            const deserializedDocumentSnapshot = deserializeDocumentSnapshot(
                stringToDeserialize,
                firestore,
                firebase.firestore.GeoPoint,
                firebase.firestore.Timestamp
            );
            basicDeserializedDocumentSnapshotTests(deserializedDocumentSnapshot, 'document-reference');
            deserializedDocumentSnapshot.data().should.have.property('a');
            deserializedDocumentSnapshot.data().a.should.have.property('id', 'simple');
            deserializedDocumentSnapshot.data().a.should.have.property('get');
            deserializedDocumentSnapshot.data().a.should.have.property('update');
            deserializedDocumentSnapshot.data().a.should.have.property('set');
            deserializedDocumentSnapshot.data().a.should.have.property('onSnapshot');
            deserializedDocumentSnapshot.data().a.should.have.property('path', 'documents/simple');
        });
    });

    describe('Documents with multiple/nested values', () => {
        it('should deserialize a document containing multiple properties', async () => {
            const stringToDeserialize = getDeserializationTestString(DeserializationTestString.Multiple);
            const deserializedDocumentSnapshot = deserializeDocumentSnapshot(
                stringToDeserialize,
                firestore,
                firebase.firestore.GeoPoint,
                firebase.firestore.Timestamp
            );
            basicDeserializedDocumentSnapshotTests(deserializedDocumentSnapshot, 'multiple');
            deserializedDocumentSnapshot.data().should.have.property('a', 'b');
            deserializedDocumentSnapshot.data().b.should.have.property('seconds');
            deserializedDocumentSnapshot.data().c.should.have.property('latitude', 4.3234);
            deserializedDocumentSnapshot.data().c.should.have.property('longitude', -2.234);
            deserializedDocumentSnapshot.data().d.should.have.property('id', 'simple');
            deserializedDocumentSnapshot.data().d.should.have.property('path', 'documents/simple');
            deserializedDocumentSnapshot.data().d.should.have.property('get');
            deserializedDocumentSnapshot.data().d.should.have.property('update');
            deserializedDocumentSnapshot.data().d.should.have.property('set');
            deserializedDocumentSnapshot.data().d.should.have.property('onSnapshot');
        });

        it('should deserialize a document containing nested properties', async () => {
            const stringToDeserialize = getDeserializationTestString(DeserializationTestString.Nested);
            const deserializedDocumentSnapshot = deserializeDocumentSnapshot(
                stringToDeserialize,
                firestore,
                firebase.firestore.GeoPoint,
                firebase.firestore.Timestamp
            );
            basicDeserializedDocumentSnapshotTests(deserializedDocumentSnapshot, 'nested');
            deserializedDocumentSnapshot.data().should.have.property('a', 'b');
            deserializedDocumentSnapshot.data().should.have.property('b');
            deserializedDocumentSnapshot.data().should.have.nested.property('b.c');
            deserializedDocumentSnapshot.data().should.have.nested.property('b.c.seconds');
            deserializedDocumentSnapshot.data().should.have.nested.property('b.d.e');
            deserializedDocumentSnapshot.data().should.have.nested.property('b.d.e[0]');
            deserializedDocumentSnapshot.data().should.have.nested.property('b.d.e[0].latitude', 3.43);
            deserializedDocumentSnapshot.data().should.have.nested.property('b.d.e[0].longitude', -3.445);
            deserializedDocumentSnapshot.data().should.have.nested.property('b.d.e[1]');
            deserializedDocumentSnapshot.data().should.have.nested.property('b.d.e[1].id', 'simple');
            deserializedDocumentSnapshot.data().should.have.nested.property('b.d.e[1].path', 'documents/simple');
            deserializedDocumentSnapshot.data().should.have.nested.property('b.d.e[1].get');
            deserializedDocumentSnapshot.data().should.have.nested.property('b.d.e[1].set');
            deserializedDocumentSnapshot.data().should.have.nested.property('b.d.e[1].update');
            deserializedDocumentSnapshot.data().should.have.nested.property('b.d.e[1].onSnapshot');
        });
    });

    describe('Queries with multiple documents', () => {
        it('should deserialize an array of DocumentSnapshots', async () => {
            const stringToDeserialize = getDeserializationTestString(DeserializationTestString.Query);
            const deserializedDocumentSnapshotArray = deserializeDocumentSnapshotArray(
                stringToDeserialize,
                firestore,
                firebase.firestore.GeoPoint,
                firebase.firestore.Timestamp
            );

            deserializedDocumentSnapshotArray.forEach(e => {
                basicDeserializedDocumentSnapshotTests(e, e.id);
            });

            deserializedDocumentSnapshotArray.should.be.an('array');
            deserializedDocumentSnapshotArray.should.have.lengthOf(8);
        });
    });
});
