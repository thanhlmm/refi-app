import { actionUpdateDoc } from "@/atoms/firestore.action";
import { monacoDataErrorAtom } from "@/atoms/ui";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import {
  addFirebaseDocSerializeMetaData,
  removeFirebaseSerializeMetaData,
} from "@/utils/common";
import { simplify } from "@/utils/simplifr";
import Editor, { OnValidate, useMonaco } from "@monaco-editor/react";
import { diff } from "deep-diff";
import firebase from "firebase";
import {
  deserializeDocumentSnapshot,
  serializeDocumentSnapshot,
} from "firestore-serializers";
import { DocRef } from "firestore-serializers/src/DocRef";
import { debounce } from "lodash";
import React, { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

interface IMonacoPropertyProps {
  doc: ClientDocumentSnapshot;
}

const monacoOption = {
  lineNumbersMinChars: 3,
  // lineNumbers: "off",
  minimap: {
    enabled: false,
  },
  folding: false,
  tabSize: 2,
  formatOnPaste: true,
  autoIndent: "full",
  scrollbar: {
    horizontalScrollbarSize: 5,
    verticalScrollbarSize: 5,
  },
  theme: "dark",
  "semanticHighlighting.enabled": true,
};

const serializeData = (doc: ClientDocumentSnapshot) => {
  return removeFirebaseSerializeMetaData(
    JSON.stringify(JSON.parse(serializeDocumentSnapshot(doc)), undefined, 2)
  );
};

const deserializeData = (
  originalDoc: ClientDocumentSnapshot,
  data: string
): ClientDocumentSnapshot => {
  return originalDoc.clone(
    deserializeDocumentSnapshot(
      addFirebaseDocSerializeMetaData(
        data,
        originalDoc.id,
        originalDoc.ref.path
      ),
      firebase.firestore.GeoPoint,
      firebase.firestore.Timestamp,
      (path) => new DocRef(path)
    ).data()
  );
};

const MonacoProperty = ({ doc }: IMonacoPropertyProps) => {
  const [defaultValue, setDefaultValue] = useState<string | undefined>(
    serializeData(doc)
  );
  const setError = useSetRecoilState(monacoDataErrorAtom(doc.ref.path));

  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      monaco.editor.setTheme("monacoProperty-light");
    }
  }, [monaco]);

  useEffect(() => {
    setDefaultValue(serializeData(doc));
  }, [doc]);

  const handleEditorValidation: OnValidate = (markers) => {
    if (markers.length === 0) {
      setError("");
      commitChange(defaultValue);
    }

    if (markers[0]) {
      // Only track the 1st error 1st
      setError(`Line ${markers[0].startLineNumber}: ${markers[0].message}`);
    }
  };

  const commitChange = debounce((docStr?: string) => {
    if (!docStr) {
      console.log("Can not parse data from JSON");
      return;
    }

    try {
      const newDoc = deserializeData(doc, docStr);
      console.log(simplify(newDoc));
      const changes = diff(doc.data(), doc.data()) || [];
      if (changes.length > 0) {
        const fieldChanges = changes
          .map((change) => change.path?.join("."))
          .filter((_) => _) as string[];

        newDoc.addChange(fieldChanges);
        actionUpdateDoc(newDoc);
      }
    } catch (error) {
      console.log(error);
    }
  }, 300);

  return (
    <>
      <Editor
        defaultLanguage="json"
        value={defaultValue}
        height="90%"
        theme="monacoProperty-light"
        wrapperClassName="border border-gray-300 pt-2 pb-2"
        onChange={setDefaultValue}
        onValidate={handleEditorValidation}
        options={monacoOption as any}
      />
      <MonacoPropertyError path={doc.ref.path} />
    </>
  );
};

export const MonacoPropertyError = ({ path }: { path: string }) => {
  const error = useRecoilValue(monacoDataErrorAtom(path));
  return <div className="mt-1 text-xs text-red-700">{error}</div>;
};

export default MonacoProperty;
