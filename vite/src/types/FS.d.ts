import { IDocRef } from "firestore-serializers";

declare namespace NSFireStore {
  interface IDocSnapshot {
    readonly id: string;
    exists: boolean;
    readonly ref: IDocRef;
    data: () => any;
    changedFields: () => string[];
    addChange: (field: string) => void;
  }
}
