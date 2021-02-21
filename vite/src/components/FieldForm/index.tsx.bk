import { useEffect, useMemo, useState } from "react";
import {
  useFormContext,
  Controller,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { Switch } from "@headlessui/react";
import { usePrevious } from "react-use";
import dayjs from "dayjs";

const fieldTypes: Record<string, any> = {
  string: "",
  number: 0,
  boolean: false,
  map: [],
  array: [],
  null: null,
  timestamp: new Date(),
  geopoint: {
    _latitude: 0,
    _longitude: 0,
  },
};

const isNumberable = (value: any) => !Boolean(Number.isNaN(Number(value)));

const fieldConverter: Record<string, Function> = {
  string: (toType: string, value: string) => {
    switch (toType) {
      case "number":
        return isNumberable(value) ? Number(value) : 0;
      case "boolean":
        return Boolean(["yes", "true"].includes(value?.toLowerCase()));

      case "map":
        try {
          return JSON.parse(value);
        } catch (error) {
          return {};
        }

      case "timestamp":
        // Try to parse
        try {
          return dayjs(value).toDate();
        } catch (error) {
          console.log(error);
          return new Date();
        }
      case "geopoint":
        try {
          const [lat, long] = value?.split(",");

          if (lat && isNumberable(lat) && long && isNumberable(long)) {
            return {
              _latitude: Number(lat),
              _longitude: Number(long),
            };
          }

          return {
            _latitude: 0,
            _longitude: 0,
          };
        } catch (error) {
          console.log(error);
          return {
            _latitude: 0,
            _longitude: 0,
          };
        }

      default:
        return null;
    }
  },
  number: (toType: string, value: number) => {
    switch (toType) {
      case "string":
        return String(value);
      case "boolean":
        return Boolean(value === 1);

      default:
        return 0;
    }
  },
  boolean: (toType: string, value: boolean) => {
    switch (toType) {
      case "string":
        return value ? "true" : "false";
      case "number":
        return value ? 1 : 0;
      default:
        return null;
    }
  },
  map: (toType: string, value: Record<string, any>) => {
    switch (toType) {
      case "string":
        return JSON.stringify(value);
      case "geopoint":
        if (isNumberable(value?._latitude) && isNumberable(value?._longitude)) {
          return {
            _latitude: value?._latitude,
            _longitude: value?._longitude,
          };
        }

        return null;
      default:
        return null;
    }
  },
  array: (toType: string, value: Record<string, any>) => {
    switch (toType) {
      case "string":
        return JSON.stringify(value);
      case "map":
        // TODO: Map array to object
        return [];
      case "geopoint":
        // TODO:
        return {
          _latitude: 0,
          _longitude: 0,
        };
    }
  },
  null: () => {
    return null;
  },
  timestamp: (toType: string, value: string) => {
    switch (toType) {
      case "string":
        return value;
      case "number":
        return Number(dayjs(value).toDate());
      default:
        return null;
    }
  },
  geopoint: (
    toType: string,
    { _latitude, _longitude }: { _latitude: number; _longitude: number }
  ) => {
    switch (toType) {
      case "string":
        return [_latitude, _longitude].join(",");
      case "map":
        return {
          _latitude,
          _longitude,
        };
      default:
        return null;
    }
  },
};

const GeopointInputComp = ({ fieldValuePath }: { fieldValuePath: string }) => {
  const { register } = useFormContext();

  return (
    <div className="flex flex-col pl-4">
      <input
        type="number"
        min={-90}
        max={90}
        defaultValue={0}
        name={`${fieldValuePath}._latitude`}
        className="input-field"
        placeholder="0.00"
        ref={register}
      />
      <input
        type="number"
        min={-90}
        max={90}
        defaultValue={0}
        name={`${fieldValuePath}._longitude`}
        className="mt-2 input-field"
        placeholder="0.00"
        ref={register}
      />
      <div>Pick location from map</div>
    </div>
  );
};

const MapInputComp = ({ fieldValuePath }: { fieldValuePath: string }) => {
  const { control, setValue, getValues } = useFormContext();
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control,
      name: fieldValuePath,
    }
  );

  useEffect(() => {
    console.log(getValues());
    append({ fieldName: "appendBill", lastName: "fieldValue" });
  }, []);

  return (
    <div className="pl-4 mt-4 border-l-2 border-gray-200">
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-row items-start mb-4">
          <div className="mr-2">
            <FieldForm
              fieldNamePath={`${fieldValuePath}[${index}].fieldName`}
              fieldValuePath={`${fieldValuePath}[${index}].fieldValue`}
              fieldTypePath={`${fieldValuePath}[${index}].fieldType`}
            />
          </div>
          <div>
            <button
              type="button"
              className="pt-2"
              tabIndex={-1}
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
      <div>
        <button
          type="button"
          className="flex items-center secondary-btn"
          onClick={() =>
            append({ fieldName: "appendBill", lastName: "fieldValue" })
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
      </div>
    </div>
  );
};

const FieldValueInput = ({
  type,
  onChange,
  value,
  fieldValuePath,
}: {
  type: string;
  onChange: Function;
  value: any;
  fieldValuePath: string;
}) => {
  switch (type) {
    case "string":
      return (
        <input
          type="text"
          className="input-field"
          placeholder="Field value"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "number":
      return (
        <input
          type="number"
          className="input-field"
          placeholder="Field value"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "boolean":
      return (
        <Switch.Group as="div" className="flex items-center pt-2 space-x-4">
          <Switch
            as="button"
            checked={value}
            onChange={(checked) => onChange(checked)}
            className={`${
              value ? "bg-indigo-600" : "bg-gray-200"
            } relative inline-flex flex-shrink-0 h-6 transition-colors duration-100 ease-in-out border-2 border-transparent rounded-full cursor-pointer w-11 focus:outline-none focus:shadow-outline`}
          >
            {({ checked }) => (
              <span
                className={`${
                  checked ? "translate-x-5" : "translate-x-0"
                } inline-block w-5 h-5 transition duration-100 ease-in-out transform bg-white rounded-full`}
              />
            )}
          </Switch>
        </Switch.Group>
      );

    case "geopoint":
      return <GeopointInputComp fieldValuePath={fieldValuePath} />;

    case "array":
      return <div>Array</div>;

    case "null":
      return <div>Null</div>;

    case "timestamp":
      return (
        <input
          type="datetime-local"
          className="input-field"
          placeholder="Field value"
          value={dayjs(value).format("YYYY-MM-DDThh:mm")}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "map":
      return <MapInputComp fieldValuePath={fieldValuePath} />;

    default:
      return (
        <input
          type="text"
          className="input-field"
          placeholder="Field value"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
};

const FieldForm = ({
  fieldNamePath,
  fieldValuePath,
  fieldTypePath,
}: {
  fieldNamePath: string;
  fieldValuePath: string;
  fieldTypePath: string;
}) => {
  const { register, control, setValue, getValues } = useFormContext();
  const fieldType = useWatch({
    control,
    name: fieldTypePath,
    defaultValue: "string",
  });
  const fieldInput = useMemo(() => {
    return (
      <Controller
        name={fieldValuePath}
        control={control}
        defaultValue=""
        render={({ onChange, onBlur, value, name, ref }) => (
          <FieldValueInput
            onChange={onChange}
            value={value}
            type={fieldType}
            fieldValuePath={fieldValuePath}
          />
        )}
      ></Controller>
    );
  }, [fieldType, fieldValuePath, control]);

  const previousType: string = usePrevious(fieldType) || "string";

  useEffect(() => {
    if (fieldType !== previousType) {
      const oldValue = getValues(fieldValuePath);
      console.log("difference", oldValue);
      const newValue =
        fieldConverter?.[previousType || "string"](fieldType, oldValue) ||
        fieldTypes[fieldType];

      // TODO: Still bug in convert string to geopoint
      setValue(fieldValuePath, newValue);

      console.log(oldValue, previousType, newValue);
    }
  }, [fieldType]);

  return (
    <div
      className={`flex items-start ${
        ["map", "array"].includes(fieldType) ? "flex-col" : "flex-row"
      }`}
    >
      <div className="relative flex-1 mr-4">
        <input
          type="text"
          name={fieldNamePath}
          className="pr-12 input-field w-60"
          placeholder="Field name"
          ref={register}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <label htmlFor="fieldType" className="sr-only">
            Type
          </label>
          <select
            tabIndex={-1}
            id="fieldType"
            name={fieldTypePath}
            className="h-full py-0 pl-2 text-gray-500 bg-transparent border-transparent rounded-md text-select-right pr-7 sm:text-sm"
            defaultValue="string"
            ref={register}
          >
            {Object.keys(fieldTypes).map((type) => (
              <option value={type} key={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex-1">{fieldInput}</div>
    </div>
  );
};

export default FieldForm;
