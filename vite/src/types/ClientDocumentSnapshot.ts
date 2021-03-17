import { IPrimitiveType } from "@/utils/simplifr";
import { DocumentData, DocumentSnapshot, IDocRef } from "firestore-serializers";
import { DocRef } from "firestore-serializers/src/DocRef";
import { isUndefined, uniq } from "lodash";
import * as immutable from "object-path-immutable";

export type IFieldValue =
  | IPrimitiveType
  | DocRef
  | firebase.firestore.GeoPoint
  | firebase.firestore.Timestamp
  | IFieldValue[];

export type IDocData = Record<string, IFieldValue>;

export class ClientDocumentSnapshot {
  readonly id: string;
  private objectData: IDocData;
  public exists = true;
  readonly ref: IDocRef;
  private changedField: string[] = [];
  queryVersion?: number;
  readonly isNew: boolean;

  static transformFromFirebase(
    docs: DocumentSnapshot[],
    queryVersion?: number
  ): ClientDocumentSnapshot[] {
    return docs.map(
      (doc) =>
        new ClientDocumentSnapshot(
          doc.data() || {},
          doc.id,
          `/${doc.ref.path}`,
          queryVersion
        )
    );
  }

  public mergeNewDoc(newDoc: ClientDocumentSnapshot): ClientDocumentSnapshot {
    return this.clone(immutable.merge(newDoc.data(), "", this.objectData));
  }

  constructor(
    data: DocumentData | IDocData,
    id: string,
    path: string,
    queryVersion?: number,
    isNew = false
  ) {
    this.id = id;
    this.objectData = data;
    this.ref = new DocRef(path);
    this.queryVersion = queryVersion;
    this.isNew = isNew;
  }

  public data(): IDocData {
    return this.objectData;
  }

  public changedFields(): string[] {
    return this.changedField;
  }

  public addChange(fields: string[]): void {
    if (!this.isNew) {
      // If document is new, we dont need to add changed field
      this.changedField = uniq([...this.changedField, ...fields]);
    }
  }

  public isChanged(): boolean {
    return this.changedField.length > 0;
  }

  public setField(field: string, newValue: any): ClientDocumentSnapshot {
    this.objectData = immutable.set(this.objectData, field, newValue);
    this.addChange([field]);

    return this;
  }

  public removeField(field: string): ClientDocumentSnapshot {
    this.objectData = immutable.del(this.objectData, field);
    this.addChange([field]);

    return this;
  }

  public clone(newData?: IDocData, newId?: string): ClientDocumentSnapshot {
    const newDocId = isUndefined(newId) ? this.id : newId;
    const newDocRef = isUndefined(newId)
      ? this.ref.path
      : this.ref.path.replace(this.id, newId);

    const newDoc = new ClientDocumentSnapshot(
      newData || this.data(),
      newDocId,
      newDocRef,
      this.queryVersion,
      this.isNew || !isUndefined(newId)
    );

    newDoc.addChange(this.changedFields());

    return newDoc;
  }
}
