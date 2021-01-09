import SuperTreeview from "react-super-treeview";
import "react-super-treeview/dist/style.css";

function TreeView() {
  const data = [
    {
      id: 1,
      name: "Parent A",
    },
    {
      id: 2,
      name: "Parent B",
      isExpanded: true,
      isChecked: true,
      children: [
        {
          id: 1,
          name: "Child 1",
        },
        {
          id: 2,
          name: "Child 2",
        },
      ],
    },
  ];
  return (
    <div>
      <SuperTreeview isCheckable={() => false} data={data} />
    </div>
  );
}

export default TreeView;
