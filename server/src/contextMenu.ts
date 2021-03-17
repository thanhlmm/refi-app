export const contextConfig = {
  "columnHeaderContext": [
    {
      id: "HIDE",
      label: "Hide column"
    },
    {
      id: "ADD",
      label: "Add column"
    },
    {
      type: "separator"
    },
    {
      id: "FILTER",
      label: "Filter by this column"
    },
    {
      type: "separator"
    },
    {
      id: "ASC",
      label: "ASC"
    },
    {
      id: "DESC",
      label: "DESC"
    }
  ],
  "treeDocContext": [
    {
      id: "NEW_COLLECTION",
      label: "New collection"
    },
    {
      type: "separator"
    },
    {
      id: "EXPORT_CSV",
      label: "Export as CSV"
    },
    {
      id: "EXPORT_JSON",
      label: "Export as JSON"
    },
    {
      type: "separator"
    },
    {
      id: "DELETE",
      label: "Delete"
    }
  ],
  "treeCollectionContext": [
    {
      id: "NEW_DOC",
      label: "New document"
    },
    {
      type: "separator"
    },
    {
      id: "IMPORT",
      label: "Import Data",
      accelerator: "CommandOrControl+I"
    },
    {
      id: "EXPORT_CSV",
      label: "Export as CSV"
    },
    {
      id: "EXPORT_JSON",
      label: "Export as JSON"
    },
    {
      type: "separator"
    },
    {
      id: "DELETE",
      label: "Delete"
    }
  ],
  "rowContext": [
    {
      id: "DUPLICATE",
      label: "Duplicate",
      accelerator: "CommandOrControl+D"
    },
    {
      type: "separator"
    },
    {
      id: "EXPORT_CSV",
      label: "Export document as CSV"
    },
    {
      id: "EXPORT_JSON",
      label: "Export document as JSON"
    },
    {
      id: "EXPORT_VIEW_CSV",
      label: "Export current table as CSV"
    },
    {
      id: "EXPORT_VIEW_JSON",
      label: "Export current table as JSON"
    },
    {
      type: "separator"
    },
    {
      id: "DELETE",
      label: "Delete"
    }
  ],
  "propertyName": [
    {
      id: "ADD_PROPERTY",
      label: "Add this field to table"
    },
    {
      id: "DELETE_PROPERTY",
      label: "Delete"
    }
  ],
  "propertyValue": [
    {
      id: "ADD_PROPERTY",
      label: "Add this field to table"
    },
    {
      id: "DELETE_PROPERTY_VALUE",
      label: "Delete"
    }
  ],
  "default": [
    {
      label: "Edit",
      submenu: [
        {
          role: "undo"
        },
        {
          role: "redo"
        },
        {
          type: "separator"
        },
        {
          role: "cut"
        },
        {
          role: "copy"
        },
        {
          role: "paste"
        }
      ]
    }]
}