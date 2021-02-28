import { docAtom, pathExpanderAtom } from "@/atoms/firestore";
import { navigatorPathAtom } from "@/atoms/navigator";
import { getListCollections } from "@/utils/common";
import { Anchor } from "@zendeskgarden/react-buttons";
import { Input } from "@zendeskgarden/react-forms";
import React, { useMemo } from "react";
import { useRecoilValue } from "recoil";

const Property = () => {
  const currentPath = useRecoilValue(navigatorPathAtom);
  const pathAvailable = useRecoilValue(pathExpanderAtom);
  const doc = useRecoilValue(docAtom(currentPath));

  const listCollections = useMemo(() => {
    return getListCollections(currentPath, pathAvailable);
  }, [currentPath, pathAvailable]);

  if (!doc) {
    return null;
  }

  return (
    <div>
      <Input placeholder="Search for property..." isCompact />
      <div>
        <h3>Collections</h3>
        {listCollections.map((collection) => (
          <div className="block" key={collection}>
            <Anchor href={collection}>{collection}</Anchor>
          </div>
        ))}
      </div>
      <div>
        <h3>Fields</h3>
        {JSON.stringify(doc.data())}
      </div>
    </div>
  );
};

export default Property;
