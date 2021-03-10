import { WhereFilterOp } from "@/atoms/navigator";

interface IOperatorSearchItem {
  value: WhereFilterOp;
  label: string;
  keyword: string;
}

export const operatorOptions: IOperatorSearchItem[] = [
  {
    value: "==",
    label: "==",
    keyword: "equal to ==",
  },
  {
    value: "<",
    label: "<",
    keyword: "less than <",
  },
  {
    value: "<=",
    label: "<=",
    keyword: "less than or equal to <=",
  },
  {
    value: ">",
    label: ">",
    keyword: "greater than >",
  },
  {
    value: ">=",
    label: ">=",
    keyword: "greater than or equal to >=",
  },
  {
    value: "!=",
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
    value: "array-contains",
    label: "array contains",
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
