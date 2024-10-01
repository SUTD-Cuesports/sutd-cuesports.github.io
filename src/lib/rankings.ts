import { createContext } from "react";
import { Player } from "./types";

export type RankingsInfo =
  | { status: "LOADING" }
  | { status: "ERROR"; msg: string }
  | { status: "LOADED"; data: Player[] };

export const RankingsContext = createContext<
  RankingsInfo & { reload: () => Promise<void> }
>({
  status: "LOADING",
  async reload() {},
});
