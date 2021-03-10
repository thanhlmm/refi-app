import { actionRemoveDocs, actionStoreDocs } from "@/atoms/firestore.action";
import {
  navigatorCollectionPathAtom,
  querierAtom,
  queryVersionAtom,
  sorterAtom,
} from "@/atoms/navigator";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import firebase from "firebase";
import { deserializeDocumentSnapshotArray } from "firestore-serializers";
import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";

interface ISubscribeResponse {
  addedData: string;
  modifiedData: string;
  removedData: string;
}

const DataSubscriber = () => {
  const collectionPath = useRecoilValue(navigatorCollectionPathAtom);
  const queryVersion = useRecoilValue(queryVersionAtom);
  const queryOptions = useRecoilValue(querierAtom(collectionPath));
  const sortOptions = useRecoilValue(sorterAtom(collectionPath));
  const listener = useRef<Function>();
  const subscribeId = useRef<string>("");

  const unsubscribe = () => {
    if (listener && listener.current) {
      listener.current();
    }

    if (subscribeId.current) {
      window.send("fs.unsubscribe", {
        id: subscribeId.current,
      });
    }
  };

  useEffect(() => {
    if (collectionPath === "/") {
      // TODO: Show empty state for choosing collection on the left side
      return;
    }

    unsubscribe();
    const topicKey = `${collectionPath}.table`;
    listener.current = window.listen(
      topicKey,
      ({ addedData, modifiedData, removedData }: ISubscribeResponse) => {
        const addedDocs = deserializeDocumentSnapshotArray(
          addedData,
          firebase.firestore.GeoPoint,
          firebase.firestore.Timestamp
        );

        actionStoreDocs(
          ClientDocumentSnapshot.transformFromFirebase(addedDocs, queryVersion)
        );

        const modifiedDocs = deserializeDocumentSnapshotArray(
          modifiedData,
          firebase.firestore.GeoPoint,
          firebase.firestore.Timestamp
        );

        actionStoreDocs(
          ClientDocumentSnapshot.transformFromFirebase(
            modifiedDocs,
            queryVersion
          )
        );

        const removedDocs = deserializeDocumentSnapshotArray(
          removedData,
          firebase.firestore.GeoPoint,
          firebase.firestore.Timestamp
        );

        actionRemoveDocs(
          ClientDocumentSnapshot.transformFromFirebase(
            removedDocs,
            queryVersion
          )
        );
      }
    );
    window
      .send("fs.queryCollection.subscribe", {
        topic: topicKey,
        path: collectionPath,
        queryOptions: queryOptions.filter(
          (option) => option.field && option.isActive
        ),
        sortOptions,
      })
      .then(({ id }) => {
        subscribeId.current = id;
      });

    return () => {
      unsubscribe();
    };
  }, [collectionPath, queryVersion]);

  return null;
};

export default DataSubscriber;
