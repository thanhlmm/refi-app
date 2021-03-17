import React from "react";
import { Checkbox, Field, Label } from "@zendeskgarden/react-forms";

interface IBooleanInputProps {
  value: boolean;
  onChange: (boolean) => void;
}

const BooleanInput = ({ value, onChange }: IBooleanInputProps) => {
  const handleCheckBoxChange = () => {
    onChange(!value);
  };

  return (
    <div className="p-1">
      <Field>
        <Checkbox checked={value} onChange={handleCheckBoxChange}>
          <Label isRegular hidden>
            {value ? "true" : "false"}
          </Label>
        </Checkbox>
      </Field>
    </div>
  );
};

export default BooleanInput;
