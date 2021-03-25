import {
  changedDocAtom,
  collectionHasBeenDeleteAtom,
  deletedDocsAtom,
  newDocsAtom,
} from "@/atoms/firestore";
import {
  actionCommitChange,
  actionReverseChange,
  actionReverseDocChange,
} from "@/atoms/firestore.action";
import { isShowPreviewChangeModalAtom } from "@/atoms/ui";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import { getParentPath } from "@/utils/common";
import { Button } from "@zendeskgarden/react-buttons";
import {
  Modal,
  Header,
  Footer,
  FooterItem,
  Body as ModalBody,
} from "@zendeskgarden/react-modals";
import classNames from "classnames";
import { Tag } from "@zendeskgarden/react-tags";
import { groupBy } from "lodash";
import React, { useCallback, useEffect, useMemo } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import EscExit from "@/components/EscExit";
import { actionGoTo } from "@/atoms/navigator.action";

const PreviewChanges = () => {
  const setShowChangeModal = useSetRecoilState(isShowPreviewChangeModalAtom);
  const changedDocs = useRecoilValue(changedDocAtom);
  const newDocs = useRecoilValue(newDocsAtom);
  const deletedDocs = useRecoilValue(deletedDocsAtom);
  const deletedCollections = useRecoilValue(collectionHasBeenDeleteAtom);

  const changes = useMemo(() => {
    return [...changedDocs, ...newDocs, ...deletedDocs];
  }, [changedDocs, newDocs, deletedDocs]);

  useEffect(() => {
    if (changes.length <= 0 && deletedCollections.length <= 0) {
      setShowChangeModal(false);
    }
  }, [changes, deletedCollections]);

  const groupSimilarDoc = useMemo(() => {
    return groupBy(changes, (doc) => getParentPath(doc.ref.path));
  }, [changes]);

  const handleOnCommit = () => {
    actionCommitChange();
    setShowChangeModal(false);
  };

  const handleOnReverseAll = () => {
    // TODO: Show confirm dialog
    actionReverseChange();
    setShowChangeModal(false);
  };

  const getTag = (
    doc: ClientDocumentSnapshot
  ): "new" | "modified" | "deleted" => {
    if (doc.isNew) {
      return "new";
    }

    if (doc.isChanged()) {
      return "modified";
    }

    return "deleted";
  };

  const handleReverseDoc = useCallback((doc: ClientDocumentSnapshot) => {
    actionReverseDocChange(doc.ref.path, getTag(doc));
  }, []);

  const handleGotoDoc = useCallback(
    (path: string) => {
      actionGoTo(path);
      setShowChangeModal(false);
    },
    [setShowChangeModal]
  );

  return (
    <div>
      <EscExit onExit={() => setShowChangeModal(false)}>
        <Modal
          isAnimated={false}
          isLarge
          focusOnMount
          backdropProps={{ onClick: () => setShowChangeModal(false) }}
        >
          <Header className="flex flex-row items-center justify-between">
            <span>Preview changes</span>
            <svg
              className="w-6 p-1 ml-auto cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              onClick={() => setShowChangeModal(false)}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Header>

          <ModalBody className="px-4">
            <table className="w-full table-fixed">
              <thead>
                <tr>
                  <th className="w-full"></th>
                  <th className="w-20"></th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {deletedCollections.map((collection) => (
                  <tr key={collection}>
                    <td>
                      <b>{collection}</b>
                    </td>
                    <td>
                      <Tag className="text-white bg-red-400">deleted</Tag>
                    </td>
                    <td />
                  </tr>
                ))}
              </tbody>
            </table>
            {Object.keys(groupSimilarDoc)
              .sort((a, b) => a.localeCompare(b))
              .map((collection) => {
                const sameParentDocs = groupSimilarDoc[collection];

                return (
                  <div key={collection}>
                    <table className="w-full table-fixed">
                      <thead>
                        <tr>
                          <th className="w-full"></th>
                          <th className="w-20"></th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={3}>
                            <svg
                              className="inline-block mr-2"
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M5 2.5l.5-.5h2l.5.5v11l-.5.5h-2l-.5-.5v-11zM6 3v10h1V3H6zm3.171.345l.299-.641 1.88-.684.64.299 3.762 10.336-.299.641-1.879.684-.64-.299L9.17 3.345zm1.11.128l3.42 9.396.94-.341-3.42-9.397-.94.342zM1 2.5l.5-.5h2l.5.5v11l-.5.5h-2l-.5-.5v-11zM2 3v10h1V3H2z"
                              />
                            </svg>
                            {collection}
                          </td>
                        </tr>
                        {sameParentDocs.map((doc) => (
                          <tr key={doc.id} className="hover:bg-gray-200 group">
                            <td className="pl-4">
                              <svg
                                className="inline-block mr-2"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M13.71 4.29l-3-3L10 1H4L3 2v12l1 1h9l1-1V5l-.29-.71zM13 14H4V2h5v4h4v8zm-3-9V2l3 3h-3z"
                                />
                              </svg>
                              <a
                                className="font-mono text-sm text-blue-500 underline cursor-pointer"
                                onClick={() => handleGotoDoc(doc.ref.path)}
                              >
                                {doc.id}
                              </a>
                            </td>
                            <td>
                              <Tag
                                className={classNames("text-white", {
                                  ["bg-red-400"]: getTag(doc) === "deleted",
                                  ["bg-blue-300"]: getTag(doc) === "modified",
                                  ["bg-green-400"]: getTag(doc) === "new",
                                })}
                              >
                                {getTag(doc)}
                              </Tag>
                            </td>
                            <td>
                              {/* // TODO: Tooltip to let user know this is reverse button */}
                              <button
                                className="p-1 opacity-0 group-hover:opacity-100"
                                onClick={() => handleReverseDoc(doc)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
          </ModalBody>
          <Footer className="p-4">
            <FooterItem>
              <Button size="small" onClick={handleOnReverseAll}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                Revert all
              </Button>
            </FooterItem>
            <FooterItem>
              <Button size="small" isPrimary onClick={handleOnCommit}>
                Commit
              </Button>
            </FooterItem>
          </Footer>
        </Modal>
      </EscExit>
    </div>
  );
};

export default PreviewChanges;
