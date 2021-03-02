import { changedDocAtom } from "@/atoms/firestore";
import {
  isShowPreviewChangeModalAtom,
  isShowDocFinderModalCommandAtom,
} from "@/atoms/ui";
import { ReadOnlyField } from "@/components/EditableCell";
import { getParentPath } from "@/utils/common";
import { Button } from "@zendeskgarden/react-buttons";
import {
  Modal,
  Header,
  Footer,
  FooterItem,
  Body as ModalBody,
} from "@zendeskgarden/react-modals";
import {
  Body,
  Cell,
  GroupRow,
  Head,
  HeaderCell,
  HeaderRow,
  Row,
  Table,
} from "@zendeskgarden/react-tables";
import { Tag } from "@zendeskgarden/react-tags";
import { groupBy } from "lodash";
import React, { useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

const Background = () => {
  const [isShowChangeModal, setShowChangeModal] = useRecoilState(
    isShowPreviewChangeModalAtom
  );
  const [
    isShowDocFinderModalCommand,
    setShowDocFinderModalCommand,
  ] = useRecoilState(isShowDocFinderModalCommandAtom);
  const changedDocs = useRecoilValue(changedDocAtom);

  const groupSimilarDoc = useMemo(() => {
    return groupBy(changedDocs, (doc) => getParentPath(doc.ref.path));
  }, [changedDocs]);

  return (
    <div>
      {isShowChangeModal && (
        <Modal
          isAnimated={false}
          isLarge
          focusOnMount
          backdropProps={{ onClick: () => setShowChangeModal(false) }}
        >
          <Header>Preview changes</Header>
          <ModalBody>
            {Object.keys(groupSimilarDoc).map((collection) => {
              const sameParentDocs = groupSimilarDoc[collection];

              return (
                <div key={collection}>
                  <Table style={{ minWidth: 500 }} size="small">
                    <GroupRow>
                      <Cell colSpan={3}>
                        <b>{collection}</b>
                      </Cell>
                    </GroupRow>
                    <Head>
                      <HeaderRow>
                        <HeaderCell>Id</HeaderCell>
                        <HeaderCell>Changed fields</HeaderCell>
                        <HeaderCell>Action</HeaderCell>
                      </HeaderRow>
                    </Head>
                    <Body>
                      {sameParentDocs.map((doc) => (
                        <Row key={doc.id}>
                          <Cell className="pl-2">
                            <ReadOnlyField value={doc.id} />
                          </Cell>
                          <Cell>
                            <ReadOnlyField>
                              {doc.changedFields().map((field) => (
                                <Tag key={field}>{field}</Tag>
                              ))}
                            </ReadOnlyField>
                          </Cell>
                          <Cell>
                            <ReadOnlyField>
                              <Button size="small">Reverse</Button>
                            </ReadOnlyField>
                          </Cell>
                        </Row>
                      ))}
                    </Body>
                  </Table>
                </div>
              );
            })}
          </ModalBody>
          <Footer>
            <FooterItem>
              <Button size="small">Reverse</Button>
            </FooterItem>
            <FooterItem>
              <Button size="small" isPrimary>
                Commit
              </Button>
            </FooterItem>
          </Footer>
        </Modal>
      )}

      {isShowDocFinderModalCommand && (
        <Modal
          isAnimated={false}
          isLarge
          focusOnMount
          backdropProps={{ onClick: () => setShowDocFinderModalCommand(false) }}
        >
          <ModalBody>
            <div
              className="py-1"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <a
                href="#"
                key="Hello"
                className="block px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                role="menuitem"
              >
                Hello
              </a>
            </div>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};

export default Background;
