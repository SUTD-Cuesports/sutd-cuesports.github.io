import { useContext } from "react";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { Player } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RankingsContext } from "@/lib/rankings";

const columns: ColumnDef<Player>[] = [
  {
    id: "index",
    cell: ({ row }) => <div className="text-center">{row.index + 1}</div>, // Adding 1 to make it 1-based instead of 0-based
    maxSize: 24, // Adjust the size as needed
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full"
        >
          Rank
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "name",
    cell: ({ row }) => <div className="px-4">{row.renderValue("name")}</div>,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    minSize: 100,
  },
  {
    accessorKey: "rating",
    cell: ({ row }) => (
      <div className="text-center">{row.renderValue("rating")}</div>
    ),
    header: () => <div className="text-center">Rating</div>,
    // minSize: 20,
    maxSize: 40,
  },
];

export function Rankings() {
  const rankings = useContext(RankingsContext);

  const data =
    rankings.status === "LOADING"
      ? "Loading..."
      : rankings.status === "ERROR"
      ? rankings.msg
      : rankings.data;

  return (
    <div>
      <h2 className="text-xl my-4">Top Rankings</h2>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
