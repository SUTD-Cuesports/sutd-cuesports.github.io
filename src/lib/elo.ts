import { Player } from "./types";

// Is there a rational for this K? idk i just put it because it seems
const K = 12;

export function getExpectedPercentage(player1: Player, player2: Player) {
  const a = 1 / (1 + Math.pow(10, (player2.rating - player1.rating) / 1200));
  return {
    player1: a,
    player2: 1 - a,
  };
}

export function calcElo(
  player1: Player,
  player2: Player,
  score: { player1: number; player2: number },
  handicap: number
) {
  const { player1: player1Expected, player2: player2Expected } =
    getExpectedPercentage(player1, player2);

  const numPlayer1Wins = score.player1 + Math.min(handicap, 0);
  const numPlayer2Wins = score.player2 - Math.max(handicap, 0);

  const totalRacks = numPlayer1Wins + numPlayer2Wins;

  console.log({
    player1Expected,
    player2Expected,
    numPlayer1Wins,
    numPlayer2Wins,
    totalRacks,
  });

  return {
    player1: Math.round(
      K * totalRacks * (numPlayer1Wins / totalRacks - player1Expected)
    ),
    player2: Math.round(
      K * totalRacks * (numPlayer2Wins / totalRacks - player2Expected)
    ),
  };
}
