import {
  WidgetProps,
  withTheme,
  utils,
  ArrayFieldTemplateProps,
  ObjectFieldTemplateProps,
} from "@rjsf/core";
import { Listbox, Transition } from "@headlessui/react";

const { getDefaultRegistry } = utils;
const { fields, widgets } = getDefaultRegistry();

function MyArrayFieldTemplate(props: ArrayFieldTemplateProps) {
  return (
    <div>
      {props.items.map((element: any) => element.children)}
      {props.canAdd && (
        <button
          type="button"
          className="flex items-center secondary-btn"
          onClick={props.onAddClick}
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
      )}
    </div>
  );
}

function MyErrorListTemplate({ errors }: { errors: any[] }) {
  return (
    <ul>
      {errors.map((error) => (
        <li key={error.stack}>{error.stack}</li>
      ))}
    </ul>
  );
}

function TextWidget(props: WidgetProps) {
  return (
    <input
      type="text"
      className="input-field"
      value={props.value}
      required={props.required}
      onChange={(event) => props.onChange(event.target.value)}
    />
  );
}

function SelectWidget(props: WidgetProps) {
  const { enumOptions, enumDisabled } = props.options;
  return (
    <div className="w-full max-w-xs mx-auto">
      <select
        tabIndex={-1}
        id="fieldType"
        className="input-field"
        defaultValue="string"
        onChange={(event) => props.onChange(event.target.value)}
        value={props.value}
      >
        {(enumOptions as any[])?.map(({ value, label }) => (
          <option value={value} key={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ObjectFieldTemplate(props: ObjectFieldTemplateProps) {
  return (
    <div>
      {props.title}
      {/* {props.description} */}
      {props.properties.map((element) => (
        <div className="property-wrapper">{element.content}</div>
      ))}
    </div>
  );
}

const ThemeObject = {
  ArrayFieldTemplate: MyArrayFieldTemplate,
  ErrorList: MyErrorListTemplate,
  ObjectFieldTemplate,
  widgets: {
    ...widgets,
    TextWidget,
    SelectWidget,
  },
};
export default withTheme(ThemeObject);
