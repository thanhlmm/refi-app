import { DocumentData, DocumentSnapshot, IDocRef } from "firestore-serializers";
import { DocRef } from "firestore-serializers/src/DocRef";
import { uniq } from "lodash";
import * as immutable from "object-path-immutable";

export class ClientDocumentSnapshot {
  readonly id: string;
  private objectData: DocumentData;
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
    data: DocumentData,
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

  public data(): DocumentData {
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

  public clone(newData?: any): ClientDocumentSnapshot {
    const newDoc = new ClientDocumentSnapshot(
      newData || this.data(),
      this.id,
      this.ref.path,
      this.queryVersion,
      this.isNew
    );

    newDoc.addChange(this.changedFields());

    return newDoc;
  }
}
