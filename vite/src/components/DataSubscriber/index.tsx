import { actionRemoveDocs, actionStoreDocs } from "@/atoms/firestore.action";
import {
  navigatorCollectionPathAtom,
  querierAtom,
  queryVersionAtom,
  sorterAtom,
} from "@/atoms/navigator";
import { actionTriggerLoadData, notifyErrorPromise } from "@/atoms/ui.action";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import firebase from "firebase";
import { deserializeDocumentSnapshotArray } from "firestore-serializers";
import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
interface ISubscribeResponse {
  addedData: string;
  modifiedData: string;
  removedData: string;
  totalDocs: number;
}

const DataSubscriber = () => {
  const collectionPath = useRecoilValue(navigatorCollectionPathAtom);
  const { queryVersion, withQuerier } = useRecoilValue(queryVersionAtom);
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
      ({
        addedData,
        modifiedData,
        removedData,
        totalDocs,
      }: ISubscribeResponse) => {
        // if (totalDocs > 50) {
        //   actionTriggerLoadData(totalDocs);
        // }

        // Take a little bit delay wait for the component transform in to Loading state
        setTimeout(() => {
          const addedDocs = ClientDocumentSnapshot.transformFromFirebase(
            deserializeDocumentSnapshotArray(
              addedData,
              firebase.firestore.GeoPoint,
              firebase.firestore.Timestamp
            ),
            queryVersion
          );

          const modifiedDocs = ClientDocumentSnapshot.transformFromFirebase(
            deserializeDocumentSnapshotArray(
              modifiedData,
              firebase.firestore.GeoPoint,
              firebase.firestore.Timestamp
            ),
            queryVersion
          );

          actionStoreDocs([...addedDocs, ...modifiedDocs]);

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
        }, 0);
      }
    );
    window
      .send("fs.queryCollection.subscribe", {
        topic: topicKey,
        path: collectionPath,
        queryOptions: withQuerier
          ? queryOptions.filter((option) => option.field && option.isActive)
          : [],
        sortOptions,
      })
      .then(({ id }) => {
        subscribeId.current = id;
      })
      .catch(notifyErrorPromise);

    return () => {
      unsubscribe();
    };
  }, [collectionPath, queryVersion, withQuerier]);

  return null;
};

export default DataSubscriber;
