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
  "treeCollectionContext": [
    {
      id: "EXPORT_CSV",
      label: "Export collection as CSV"
    },
    {
      id: "EXPORT_JSON",
      label: "Export collection as JSON"
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
      role: 'copy',
      label: "Copy"
    },
    {
      id: "DUPLICATE",
      label: "Duplicate"
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
      id: "DELETE_PROPERTY",
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