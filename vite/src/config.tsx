import { configure } from "react-hotkeys";
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

/**
 * Config react-hotkeys
 */
configure({
  // logLevel: "debug",
  ignoreTags: ["select"],
});

/**
 * Config monaco-editor
 */
loader.config({
  paths: {
    vs: "/vs",
  },
});

function createDependencyProposals(range) {
  return [
    {
      label: "/geopoint",
      kind: monaco.languages.CompletionItemKind.Value,
      detail: "Insert GeoPoint value",
      insertText: '"__GeoPoint__${1:0}###${2:0}"',
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
    {
      label: "/reference",
      kind: monaco.languages.CompletionItemKind.Value,
      detail: "Insert Reference value",
      insertText: '"__DocumentReference__${1:/users/elonMusk}"',
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
    {
      label: "/timestamp",
      kind: monaco.languages.CompletionItemKind.Value,
      detail: "Insert Timestamp value",
      insertText: '"__Timestamp__${1:0}"',
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
    {
      label: "/array",
      kind: monaco.languages.CompletionItemKind.Value,
      detail: "Insert Array value",
      insertText: "[${1}\n]",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
    {
      label: "/map",
      kind: monaco.languages.CompletionItemKind.Value,
      detail: "Insert Map/Object value",
      insertText: "[${1}\n]",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
    {
      label: "/object",
      kind: monaco.languages.CompletionItemKind.Value,
      detail: "Insert Map/Object value",
      insertText: "{${1}\n}",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
  ];
}

const legend = {
  tokenTypes: ["__GeoPoint__", "__DocumentReference__", "__Timestamp__"],
  tokenModifiers: [],
};

const tokenPattern = /__(.*)__/g;

function getType(type) {
  return legend.tokenTypes.indexOf(type);
}

// Try to preload the editor
loader.init().then((monaco) => {
  monaco.languages.registerDocumentSemanticTokensProvider("json", {
    getLegend: function () {
      return legend;
    },
    provideDocumentSemanticTokens: function (model, lastResultId, token) {
      const lines = model.getLinesContent();

      /** @type {number[]} */
      const data: any[] = [];

      let prevLine = 0;
      let prevChar = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        for (
          let match: null | RegExpExecArray = null;
          (match = tokenPattern.exec(line));

        ) {
          // translate token and modifiers to number representations
          const type = getType(match[0]);
          if (type === -1) {
            continue;
          }
          const modifier = 0;

          data.push(
            // translate line to deltaLine
            i - prevLine,
            // for the same line, translate start to deltaStart
            prevLine === i ? match.index - prevChar : match.index,
            match[0].length,
            type,
            modifier
          );

          prevLine = i;
          prevChar = match.index;
        }
      }
      return {
        data: new Uint32Array(data),
        resultId: undefined,
      };
    },
    releaseDocumentSemanticTokens: function (resultId) {
      return;
    },
  });
  monaco.editor.defineTheme("monacoProperty-light", {
    base: "vs",
    inherit: true,
    colors: {},
    rules: [
      { token: "__GeoPoint__", foreground: "0000ff", fontStyle: "bold" },
      {
        token: "__DocumentReference__",
        foreground: "0000ff",
        fontStyle: "bold",
      },
      { token: "__Timestamp__", foreground: "0000ff", fontStyle: "bold" },
    ],
  });

  monaco.editor.defineTheme("monacoProperty-dark", {
    base: "vs-dark",
    inherit: true,
    colors: {},
    rules: [
      { token: "__GeoPoint__", foreground: "0000ff", fontStyle: "bold" },
      {
        token: "__DocumentReference__",
        foreground: "0000ff",
        fontStyle: "bold",
      },
      { token: "__Timestamp__", foreground: "0000ff", fontStyle: "bold" },
    ],
  });

  monaco.languages.registerCompletionItemProvider("json", {
    provideCompletionItems: function (model, position) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      return {
        suggestions: createDependencyProposals(range),
      };
    },
  });
});

export default {};
