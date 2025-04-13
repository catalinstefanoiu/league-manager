import { Injectable } from '@angular/core';
import { Team } from '../models/team.model';

export type FixtureMatch = {
  homeTeam: Team;
  awayTeam: Team;
  date: Date;
  round: number
};

@Injectable({
  providedIn: 'root',
})
export class FixtureService {
  generateFixtures(teams: Team[], startDate: Date): FixtureMatch[] {
    const fixtures: FixtureMatch[] = [];
    const totalRounds = (teams.length - 1);
    const totalTeams = teams.length;

    const shuffledTeams = [...teams];

    for (let round = 0; round < totalRounds; round++) {
      const matchDate = new Date(startDate);
      matchDate.setDate(startDate.getDate() + round * 7); // Weekly intervals, adding variation for each match in the round
      
      for (let i = 0; i < totalTeams / 2; i++) {
        const homeTeam = shuffledTeams[i];
        const awayTeam = shuffledTeams[totalTeams - 1 - i];

        fixtures.push({
          homeTeam: round % 2 === 0 ? homeTeam : awayTeam, // Alternate home/away
          awayTeam: round % 2 === 0 ? awayTeam : homeTeam,
          date: matchDate,
          round: round + 1
        });
      }

      // Rotate teams for the next round
      shuffledTeams.splice(1, 0, shuffledTeams.pop()!);
    }

    // Add the reverse fixtures for the second half of the season
    for (let i = 0, len = fixtures.length; i < len; i++) {
      const fixture = fixtures[i];
      const matchDate = new Date(startDate);
      matchDate.setDate(startDate.getDate() + (fixture.round - 1 + totalRounds) * 7);

      fixtures.push({
        homeTeam: fixture.awayTeam,
        awayTeam: fixture.homeTeam,
        date: matchDate,
        round: fixture.round + totalRounds
      });
    }

    return fixtures;
  }

  getTotalRounds(teamCount: number): number {
    return (teamCount - 1) * 2; // Double round-robin
  }
}
