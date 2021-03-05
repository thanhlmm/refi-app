export const contextConfig = {
  "columnHeaderContext": [
    {
      id: "HIDE",
      label: "Hide column"
    },
    {
      id: "ADD",
      label: "Add column"
    }
  ],
  "logTemplate": [
    {
      id: "log",
      label: "Log me"
    },
    {
      type: "separator"
    },
    {
      id: "calculate",
      label: "Open calculator"
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