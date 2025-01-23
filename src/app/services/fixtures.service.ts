import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FixturesService {
  generateFixtures(
    teams: string[]
  ): { homeTeam: string; awayTeam: string; date: Date; round: number }[] {
    const fixtures: { homeTeam: string; awayTeam: string; date: Date; round: number }[] = [];
    const totalRounds = (teams.length - 1) * 2; // Double round-robin
    const totalTeams = teams.length;

    const shuffledTeams = [...teams];
    const startDate = new Date(); // Starting point for the matches

    for (let round = 0; round < totalRounds; round++) {
      for (let i = 0; i < totalTeams / 2; i++) {
        const homeTeam = shuffledTeams[i];
        const awayTeam = shuffledTeams[totalTeams - 1 - i];
        const matchDate = new Date(startDate);
        matchDate.setDate(startDate.getDate() + round * 7 + i); // Weekly intervals, adding variation for each match in the round

        fixtures.push({
          homeTeam: round % 2 === 0 ? homeTeam : awayTeam, // Alternate home/away
          awayTeam: round % 2 === 0 ? awayTeam : homeTeam,
          date: matchDate,
          round: Math.floor(round / (totalRounds / 2)) + 1,
        });
      }

      // Rotate teams for the next round
      shuffledTeams.splice(1, 0, shuffledTeams.pop()!);
    }

    return fixtures;
  }

  getTotalRounds(teamCount: number): number {
    return (teamCount - 1) * 2; // Double round-robin
  }
}
