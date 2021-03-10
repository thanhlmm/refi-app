import React, { useEffect, useState } from "react";
import { ClientDocumentSnapshot } from "@/types/ClientDocumentSnapshot";
import Editor from "@monaco-editor/react";
import { debounce } from "lodash";
import { diff } from "deep-diff";
import { actionUpdateDoc } from "@/atoms/firestore.action";

interface IMonacoPropertyProps {
  doc: ClientDocumentSnapshot;
}

const monacoOption = {
  lineNumbersMinChars: 2,
  lineNumbers: "off",
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
};

const MonacoProperty = ({ doc }: IMonacoPropertyProps) => {
  const [defaultValue, setDefaultValue] = useState<string | undefined>(
    JSON.stringify(doc.data(), undefined, 2)
  );

  useEffect(() => {
    setDefaultValue(JSON.stringify(doc.data(), undefined, 2));
  }, [doc]);

  const handleEditorValidation = (markers: any[]) => {
    if (markers.length === 0) {
      commitChange(defaultValue);
    }
    markers.forEach((marker) => console.log("onValidate:", marker.message));
  };

  const commitChange = debounce((docStr?: string) => {
    if (!docStr) {
      return;
    }

    try {
      const docValue = JSON.parse(docStr);
      const changes = diff(doc.data(), docValue) || [];
      const newDoc = doc.clone(docValue);
      const fieldChanges = changes
        .map((change) => change.path?.join("."))
        .filter((_) => _) as string[];

      newDoc.addChange(fieldChanges);
      actionUpdateDoc(newDoc);
    } catch (error) {
      console.log(error);
    }
  }, 300);

  return (
    <Editor
      defaultLanguage="json"
      value={defaultValue}
      onChange={setDefaultValue}
      onValidate={handleEditorValidation}
      options={monacoOption as any}
    />
  );
};

export default MonacoProperty;
