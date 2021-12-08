import { actionUpdateDoc } from "@/atoms/firestore.action";
import { monacoDataErrorAtom } from "@/atoms/ui";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import {
  addFirebaseDocSerializeMetaData,
  removeFirebaseSerializeMetaData,
} from "@/utils/common";
import Editor, { Monaco, OnValidate, useMonaco } from "@monaco-editor/react";
import { diff } from "deep-diff";
import firebase from "firebase/app";
import {
  deserializeDocumentSnapshot,
  serializeDocumentSnapshot,
  DocRef,
} from "firestore-serializers";
import { debounce } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import "./monaco.css";

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
  wordWrap: "bounded",
  theme: "monacoProperty-light",
  "semanticHighlighting.enabled": true,
};

const serializeData = (doc: ClientDocumentSnapshot) => {
  return removeFirebaseSerializeMetaData(
    JSON.stringify(JSON.parse(serializeDocumentSnapshot(doc)))
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
  const editorView = useRef<any>();
  const setError = useSetRecoilState(monacoDataErrorAtom(doc.ref.path));

  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      monaco.editor.onDidCreateEditor((view) => {
        editorView.current = view;
      });
    }
  }, [monaco]);

  useEffect(() => {
    if (editorView.current) {
      editorView.current.setScrollTop(0);
    }
  }, [doc.ref.path]);

  useEffect(() => {
    // If user is editing on monaco editor. Do not sync outside value to it
    // TODO: Check if new version of monaco change this div className
    if (
      !document.activeElement?.classList.contains("monaco-mouse-cursor-text")
    ) {
      setDefaultValue(serializeData(doc));
    }
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
      const changes = diff(doc.data(), newDoc.data()) || [];
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
    <div className="flex flex-col h-full overflow-hidden">
      <Editor
        defaultLanguage="json"
        value={defaultValue}
        height="100%"
        theme="monacoProperty-light"
        wrapperClassName="border border-gray-300 pt-2 pb-2"
        onChange={setDefaultValue}
        onValidate={handleEditorValidation}
        options={monacoOption as any}
        line={1}
      />
      <MonacoPropertyError path={doc.ref.path} />
    </div>
  );
};

export const MonacoPropertyError = ({ path }: { path: string }) => {
  const error = useRecoilValue(monacoDataErrorAtom(path));

  return (
    <div
      className="p-1 text-xs text-red-700 truncate border-b border-l border-r border-gray-300"
      style={{ minHeight: "1.5rem" }}
    >
      {error}
    </div>
  );
};

export default MonacoProperty;
