import {
  changedDocAtom,
  deletedDocsAtom,
  newDocsAtom,
} from "@/atoms/firestore";
import {
  actionCommitChange,
  actionReverseDocChange,
} from "@/atoms/firestore.action";
import { isShowPreviewChangeModalAtom } from "@/atoms/ui";
import { ReadOnlyField } from "@/components/EditableCell";
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

const PreviewChanges = () => {
  const setShowChangeModal = useSetRecoilState(isShowPreviewChangeModalAtom);
  const changedDocs = useRecoilValue(changedDocAtom);
  const newDocs = useRecoilValue(newDocsAtom);
  const deletedDocs = useRecoilValue(deletedDocsAtom);

  const changes = useMemo(() => {
    return [...changedDocs, ...newDocs, ...deletedDocs];
  }, [changedDocs, newDocs, deletedDocs]);

  useEffect(() => {
    if (changes.length <= 0) {
      setShowChangeModal(false);
    }
  }, [changes]);

  const groupSimilarDoc = useMemo(() => {
    return groupBy(changes, (doc) => getParentPath(doc.ref.path));
  }, [changes]);

  const handleOnCommit = () => {
    actionCommitChange();
    setShowChangeModal(false);
  };

  const handleOnReverseAll = () => {
    // TODO: Show confirm dialog
    actionCommitChange();
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
                            <b>{collection}</b>
                          </td>
                        </tr>
                        {sameParentDocs.map((doc) => (
                          <tr key={doc.id} className="hover:bg-gray-200 group">
                            <td className="pl-2 font-mono text-sm">{doc.id}</td>
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
                Reverse all
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
