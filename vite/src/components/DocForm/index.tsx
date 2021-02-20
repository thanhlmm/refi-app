import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import FieldForm from "@/components/FieldForm";
import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import Form from "@rjsf/core";
import ThemeForm from "../ThemeForm/index";

const fieldTypes = [
  "string",
  "number",
  "boolean",
  "map",
  "array",
  "null",
  "timestamp",
  "geopoint",
];

const DocForm = () => {
  const [docValue, setDocValue] = useState("");
  const formRef = useForm();
  const { register, handleSubmit, control, errors } = formRef;
  const onSubmit = (data: any) => console.log(data);

  window.form = formRef;

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control,
      name: "mainObject",
    }
  );

  useEffect(() => {
    append({ fieldName: "", fieldValue: "", fieldType: "string" });
  }, []);

  return (
    <div className="flex flex-row">
      <div className="flex-1">
        <Editor
          language="json"
          value={JSON.stringify(docValue)}
          options={{
            minimap: {
              enabled: false,
            },
            automaticLayout: true,
          }}
        />
      </div>
      <div className="flex-1">
        <ThemeForm
          schema={{
            type: "array",
            items: {
              $ref: "#/definitions/field",
            },
            definitions: {
              field: {
                type: "object",
                allOf: [
                  {
                    properties: {
                      name: {
                        type: "string",
                      },
                      type: {
                        type: "string",
                        enum: [
                          "string",
                          "number",
                          "map",
                          "array",
                          "geopoint",
                          "null",
                          "timestamp",
                        ],
                      },
                    },
                  },
                  {
                    oneOf: [
                      {
                        title: "string",
                        properties: {
                          value: { type: "string" },
                        },
                      },
                      {
                        title: "number",
                        properties: {
                          value: { type: "number" },
                        },
                      },
                      {
                        title: "map",
                        properties: {
                          value: {
                            $ref: "#/definitions/field",
                          },
                        },
                      },
                      {
                        title: "array",
                        properties: {
                          value: {
                            type: "array",
                            items: {
                              $ref: "#/definitions/field",
                            },
                          },
                        },
                      },
                      {
                        title: "null",
                        properties: {
                          value: { type: "null" },
                        },
                      },
                    ],
                  },
                ],
              },
            },
          }}
          formData={docValue}
          onChange={(value) => setDocValue(value.formData)}
        />
      </div>
    </div>
  );
};

export default DocForm;
