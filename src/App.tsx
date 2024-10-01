import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rankings } from "./pages/Rankings";
import { Race } from "./pages/Race";
import { RankingsInfo, RankingsContext } from "./lib/rankings";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

function App() {
  const [rankings, setRankings] = useState<RankingsInfo>({ status: "LOADING" });

  async function loadRankings() {
    const res = await supabase
      .from("rankings")
      .select("*")
      .order("rating", { ascending: false });

    if (res.error) {
      setRankings({
        status: "ERROR",
        msg: `Error loading rankings: ${res.error}`,
      });
    } else {
      setRankings({
        status: "LOADED",
        data: res.data,
      });
    }
  }

  useEffect(() => {
    loadRankings();

    const root = window.document.documentElement;

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    root.classList.add(systemTheme);
  }, []);

  return (
    <RankingsContext.Provider value={{ ...rankings, reload: loadRankings }}>
      <Tabs defaultValue="rankings">
        <TabsList>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
          <TabsTrigger value="race">Race</TabsTrigger>
        </TabsList>
        <TabsContent value="rankings">
          <Rankings />
        </TabsContent>
        <TabsContent value="race">
          <Race />
        </TabsContent>
      </Tabs>
    </RankingsContext.Provider>
  );
}

export default App;
