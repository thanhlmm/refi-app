interface IOperatorSearchItem {
  value: string;
  label: string;
  keyword: string;
}

export const operatorOptions: IOperatorSearchItem[] = [
  {
    value: "eq",
    label: "==",
    keyword: "equal to ==",
  },
  {
    value: "lt",
    label: "<",
    keyword: "less than <",
  },
  {
    value: "lte",
    label: "<=",
    keyword: "less than or equal to <=",
  },
  {
    value: "gt",
    label: ">",
    keyword: "greater than >",
  },
  {
    value: "gte",
    label: ">=",
    keyword: "greater than or equal to >=",
  },
  {
    value: "ne",
    label: "!=",
    keyword: "not equal to !=",
  },
  {
    value: "in",
    label: "equal to any of",
    keyword: "equal to any of",
  },
  {
    value: "not-in",
    label: "not equal to any of",
    keyword: "not equal to any of",
  },
  {
    value: "arrays-contains",
    label: "arrays contains",
    keyword: "array contains",
  },
  {
    value: "array-contains-any",
    label: "arrays contains any",
    keyword: "array contains any",
  },
];

// export const searchOperator = new MiniSearch<IOperatorSearchItem>({
//   fields: ["keyword", "type", "label"],
//   storeFields: ["type", "label"],
//   idField: "value",
// });

// searchOperator.addAll(operatorOptions);
