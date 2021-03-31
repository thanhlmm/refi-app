import { queryDocOrder } from "@/atoms/firestore";
import {
  actionGetDocs,
  actionRemoveDocs,
  actionStoreDocs,
} from "@/atoms/firestore.action";
import {
  navigatorCollectionPathAtom,
  navigatorPathAtom,
  querierAtom,
  queryVersionAtom,
  sorterAtom,
} from "@/atoms/navigator";
import { setRecoilExternalState } from "@/atoms/RecoilExternalStatePortal";
import { actionTriggerLoadData, notifyErrorPromise } from "@/atoms/ui.action";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import { getCollectionPath, isCollection } from "@/utils/common";
import firebase from "firebase/app";
import { deserializeDocumentSnapshotArray } from "firestore-serializers";
import { uniq } from "lodash";
import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
interface ISubscribeResponse {
  addedData: string;
  modifiedData: string;
  removedData: string;
  totalDocs: number;
  isInitResult: boolean;
}

interface IDataBackgroundResponse {
  docs: string;
  type: "added" | "remove" | "modified";
}

const DataSubscriber = () => {
  const path = useRecoilValue(navigatorPathAtom);
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
        isInitResult,
      }: ISubscribeResponse) => {
        // if (totalDocs > 50) {
        //   actionTriggerLoadData(totalDocs);
        // }

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

        const removedDocs = ClientDocumentSnapshot.transformFromFirebase(
          deserializeDocumentSnapshotArray(
            removedData,
            firebase.firestore.GeoPoint,
            firebase.firestore.Timestamp
          ),
          queryVersion
        );

        // Save list of collection to respect the order
        if (isInitResult) {
          setRecoilExternalState(
            queryDocOrder(queryVersion),
            addedDocs.map((doc) => doc.ref.path)
          );
        } else {
          setRecoilExternalState(queryDocOrder(queryVersion), (paths) =>
            uniq([...paths, ...addedDocs.map((doc) => doc.ref.path)])
          );
        }

        // Take a little bit delay wait for the component transform in to Loading state
        setTimeout(() => {
          actionStoreDocs({
            added: addedDocs,
            modified: modifiedDocs,
            removed: removedDocs,
          });
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
        queryVersion,
      })
      .then(({ id }) => {
        subscribeId.current = id;
      })
      .catch(notifyErrorPromise);

    return () => {
      unsubscribe();
    };
  }, [collectionPath, queryVersion, withQuerier]);

  useEffect(() => {
    // Query document by path
    if (!isCollection(path)) {
      // Wait a little bit before fetch doc data
      requestAnimationFrame(() => {
        actionGetDocs([path]);
      });
    }
  }, [path]);

  useEffect(() => {
    const listener = window.listen(
      "data_background",
      ({ docs, type }: IDataBackgroundResponse) => {
        switch (type) {
          case "added":
            const addedDocs = ClientDocumentSnapshot.transformFromFirebase(
              deserializeDocumentSnapshotArray(
                docs,
                firebase.firestore.GeoPoint,
                firebase.firestore.Timestamp
              ),
              queryVersion
            ).filter(
              (doc) => getCollectionPath(doc.ref.path) !== collectionPath
            );

            actionStoreDocs({ added: addedDocs });
            break;
          case "modified":
            const modifiedDocs = ClientDocumentSnapshot.transformFromFirebase(
              deserializeDocumentSnapshotArray(
                docs,
                firebase.firestore.GeoPoint,
                firebase.firestore.Timestamp
              ),
              queryVersion
            ).filter(
              (doc) => getCollectionPath(doc.ref.path) !== collectionPath
            );

            actionStoreDocs({ modified: modifiedDocs });
            break;
        }
      }
    );

    return () => {
      listener();
    };
  }, [queryVersion]);

  return null;
};

export default DataSubscriber;
