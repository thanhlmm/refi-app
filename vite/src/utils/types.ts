export type SimpleJsonType =
  | string
  | number
  | boolean
  | SimpleJsonType[]
  | {
      [key: string]: SimpleJsonType;
    };
