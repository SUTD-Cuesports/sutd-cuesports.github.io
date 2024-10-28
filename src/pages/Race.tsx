import { Button } from "@/components/ui/button";
import { ComboBox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RankingsContext, SPECIAL_BOYS } from "@/lib/rankings";
import { Player } from "@/lib/types";
import { useContext, useState } from "react";
import { Crown, PlusIcon, X } from "lucide-react";
import { calcElo } from "@/lib/elo";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Score {
  player1: number;
  player2: number;
}

export function Race() {
  const rankings = useContext(RankingsContext);
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [raceLength, setRaceLength] = useState<number>(5);
  const [handicap, setHandicap] = useState<number>(0);
  const [raceStatus, setRaceStatus] = useState<Score | null>(null);
  const [diffs, setDiffs] = useState<Score | null>(null);

  if (rankings.status === "LOADING") {
    return "Loading..."; // TODO nice
  }
  if (rankings.status === "ERROR") {
    return rankings.msg; // TODO nice
  }

  function handleRack(score: Score) {
    if (player1 === null || player2 === null) return;
    setRaceStatus(score);

    if (score.player1 !== raceLength && score.player2 !== raceLength) return;

    const diffs = calcElo(player1, player2, score, handicap);

    if (
      SPECIAL_BOYS.includes(player1.id) &&
      !SPECIAL_BOYS.includes(player2.id) &&
      diffs.player2 < 0
    ) {
      diffs.player2 = 0;
    }
    if (
      SPECIAL_BOYS.includes(player2.id) &&
      !SPECIAL_BOYS.includes(player1.id) &&
      diffs.player1 < 0
    ) {
      diffs.player1 = 0;
    }

    setDiffs(diffs);

    Promise.all([
      supabase
        .from("rankings")
        .update({ rating: player1.rating + diffs.player1, isVirgin: false })
        .eq("id", player1.id),
      supabase
        .from("rankings")
        .update({ rating: player2.rating + diffs.player2, isVirgin: false })
        .eq("id", player2.id),
    ]).then(() => rankings.reload());
  }

  function resetRace() {
    setPlayer1(null);
    setPlayer2(null);
    setRaceLength(5);
    setHandicap(0);
    setRaceStatus(null);
    setDiffs(null);
  }

  if (raceStatus !== null && player1 !== null && player2 !== null) {
    const player1Won = raceStatus.player1 === raceLength;
    const player2Won = raceStatus.player2 === raceLength;

    const closeButton = (
      <Button
        variant="ghost"
        className="absolute right-0 top-0"
        onClick={player1Won || player2Won ? resetRace : undefined}
      >
        <X size="1rem" />
      </Button>
    );

    return (
      <div className="relative">
        {player1Won || player2Won ? (
          closeButton
        ) : (
          <Dialog>
            <DialogTrigger asChild>{closeButton}</DialogTrigger>
            <DialogContent showClose={false} className="max-w-72">
              <DialogHeader>
                <DialogTitle>
                  Are you sure you want to end the race?
                </DialogTitle>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="destructive"
                  className="w-16"
                  onClick={resetRace}
                >
                  Yes
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="secondary" className="w-16">
                    No
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <h3 className="text-xl my-4">Race to {raceLength}</h3>
        <div className="flex justify-between gap-x-4 md:justify-start md:gap-x-40">
          <div>
            <div className="flex gap-x-2 md:gap-x-6 items-center ">
              <div className="text-center text-semibold">
                {player1.name}{" "}
                <span className="text-sm text-muted-foreground">
                  ({player1.rating}
                  {diffs && <Diff diff={diffs.player1} />})
                </span>
              </div>
              <div className="font-bold ml-4">{raceStatus.player1}</div>
            </div>
            <Button
              variant="outline"
              className={cn("w-full mt-2 group", {
                "bg-primary": player1Won,
                "opacity-0": player2Won,
                "pointer-events-none": player1Won || player2Won,
              })}
              onClick={() => {
                if (player1Won || player2Won) return;
                handleRack({
                  player1: raceStatus.player1 + 1,
                  player2: raceStatus.player2,
                });
              }}
            >
              {player1Won ? (
                <Crown className="p-2 w-9 h-9" />
              ) : (
                <PlusIcon className="opacity-50 p-2 w-9 h-9 rounded-full transition group-hover:opacity-100 group-hover:bg-accent" />
              )}
            </Button>
          </div>

          <div className="text-muted-foreground flex justify-center items-center">
            vs
          </div>

          <div>
            <div className="flex gap-x-6 items-center ">
              <div className="font-bold mr-4">{raceStatus.player2}</div>
              <div className="text-center text-semibold">
                {player2.name}{" "}
                <span className="text-sm text-muted-foreground">
                  ({player2.rating}
                  {diffs && <Diff diff={diffs.player2} />})
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className={cn("w-full mt-2 group", {
                "opacity-0": player1Won,
                "bg-primary": player2Won,
                "pointer-events-none": player1Won || player2Won,
              })}
              onClick={() => {
                if (player1Won || player2Won) return;
                handleRack({
                  player1: raceStatus.player1,
                  player2: raceStatus.player2 + 1,
                });
              }}
            >
              {player2Won ? (
                <Crown className="p-2 w-9 h-9" />
              ) : (
                <PlusIcon className="opacity-50 p-2 w-9 h-9 rounded-full transition group-hover:opacity-100 group-hover:bg-accent" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const changeRaceLength = (newLength: number) => {
    if (Math.abs(handicap) >= newLength) {
      setHandicap(Math.sign(handicap) * (newLength - 1));
    }
    setRaceLength(newLength);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row">
        <div>
          <PlayerInfo
            player={player1}
            setPlayer={setPlayer1}
            header="Player 1"
          />
          <PlayerInfo
            player={player2}
            setPlayer={setPlayer2}
            header="Player 2"
          />
        </div>
        <Separator orientation="vertical" className="self-stretch mx-4" />
        <div className="flex-1">
          <div className="w-full py-2">
            <h3 className="text-lg">Race to</h3>
            <div className="flex gap-x-4">
              <Input
                type="number"
                value={raceLength}
                onChange={(e) => {
                  if (e.target.value === "") {
                    changeRaceLength(0);
                  }

                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && isFinite(value) && value >= 0) {
                    changeRaceLength(value);
                  }
                }}
                className="w-20"
              />
              <Slider
                value={[raceLength]}
                onValueChange={(value) => changeRaceLength(value[0])}
                showThumb={[true]}
                min={1}
                max={25}
                step={1}
              />
            </div>
          </div>
          <div className="w-full py-2">
            <div className="flex gap-x-4">
              <h3 className="text-lg w-20">Handicap</h3>
              <span>{player1?.name ?? "Player 1"}</span>
              <div className="flex-1"></div>
              <span>{player2?.name ?? "Player 2"}</span>
            </div>
            <div className="flex gap-x-4">
              <Input
                type="number"
                value={handicap}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && isFinite(value)) {
                    setHandicap(value);
                  }
                }}
                className="w-20"
              />
              <Slider
                value={handicap <= 0 ? [handicap, 0] : [0, handicap]}
                showThumb={[handicap <= 0, handicap > 0]}
                onValueChange={(value) => {
                  setHandicap(
                    value[0] === 0 || value[0] === handicap
                      ? value[1]
                      : value[0]
                  );
                }}
                min={-raceLength + 1}
                max={+raceLength - 1}
                step={1}
              />
            </div>
          </div>
        </div>
      </div>
      <Button
        disabled={
          player1 === null ||
          player2 === null ||
          player1.id === player2.id ||
          raceLength <= 0
        }
        onClick={() => {
          setRaceStatus({
            player1: Math.max(0, -handicap),
            player2: Math.max(0, handicap),
          });
        }}
      >
        Start race
      </Button>
    </div>
  );
}

function Diff({ diff }: { diff: number }) {
  if (diff === 0) return null;

  if (diff < 0) {
    return <span className="text-red-600"> {diff}</span>;
  } else {
    return (
      <span className="text-green-500">
        {" +"}
        {diff}
      </span>
    );
  }
}

interface PlayerInfoOpts {
  header: string;
  player: Player | null;
  setPlayer: (player: Player) => void;
}

function PlayerInfo({ player, setPlayer, header }: PlayerInfoOpts) {
  const rankings = useContext(RankingsContext);
  if (rankings.status !== "LOADED") return null;

  return (
    <div className="py-2">
      <h3 className="text-lg">{header}</h3>
      <ComboBox
        value={player}
        setValue={setPlayer}
        selectedPlaceholder="Select player"
        filterPlaceholder="Filter players"
        renderValue={(player) => (
          <div className="flex justify-between w-full">
            <span className="text-semibold">{player.name}</span>
            <span className="w-2"></span>
            <span className="font-normal text-muted-foreground">
              {player.rating}
            </span>
          </div>
        )}
        values={rankings.data}
        className="w-72"
      />
    </div>
  );
}
