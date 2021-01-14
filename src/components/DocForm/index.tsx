import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import FieldForm from "@/components/FieldForm";
import { useEffect } from "react";

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
    <div>
      <FormProvider {...formRef}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-row items-start mb-4">
              <div className="mr-2">
                <FieldForm
                  fieldNamePath={`mainObject[${index}].fieldName`}
                  fieldValuePath={`mainObject[${index}].fieldValue`}
                  fieldTypePath={`mainObject[${index}].fieldType`}
                />
              </div>
              <div>
                <button
                  type="button"
                  tabIndex={-1}
                  className="pt-2"
                  onClick={() => remove(index)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-6 h-6 text-red-500 fill-current hover:text-red-600"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="flex items-center secondary-btn"
            onClick={() =>
              append({ fieldName: "", fieldValue: "", fieldType: "string" })
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-6 h-6 mr-1 fill-current text-grey hover:text-grey-darkest"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>{" "}
            Add field
          </button>

          <div className="block text-right">
            <input className="primary-btn" type="submit" />
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default DocForm;
