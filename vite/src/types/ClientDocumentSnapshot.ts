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
    queryVersion?: number
  ) {
    this.id = id;
    this.objectData = data;
    this.ref = new DocRef(path);
    this.queryVersion = queryVersion;
  }

  public data(): DocumentData {
    return this.objectData;
  }

  public changedFields(): string[] {
    return this.changedField;
  }

  public addChange(fields: string[]): void {
    this.changedField = uniq([...this.changedField, ...fields]);
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
      this.queryVersion
    );

    newDoc.addChange(this.changedFields());

    return newDoc;
  }
}
