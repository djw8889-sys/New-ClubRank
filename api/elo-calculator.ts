const K = 32; // K-factor determines how much ratings change

// calculateElo 함수를 export 하도록 수정
export function calculateElo(player1Rating: number, player2Rating: number, result: 'win' | 'loss' | 'draw') {
  const expectedScore1 = 1 / (1 + Math.pow(10, (player2Rating - player1Rating) / 400));
  const expectedScore2 = 1 / (1 + Math.pow(10, (player1Rating - player2Rating) / 400));

  let actualScore1: number;
  let actualScore2: number;

  if (result === 'win') {
    actualScore1 = 1;
    actualScore2 = 0;
  } else if (result === 'loss') {
    actualScore1 = 0;
    actualScore2 = 1;
  } else { // draw
    actualScore1 = 0.5;
    actualScore2 = 0.5;
  }

  const newRating1 = player1Rating + K * (actualScore1 - expectedScore1);
  const newRating2 = player2Rating + K * (actualScore2 - expectedScore2);

  return {
    player1Elo: Math.round(newRating1),
    player2Elo: Math.round(newRating2),
  };
}
