import { FirestoreDataConverter, QueryDocumentSnapshot, WithFieldValue } from 'firebase-admin/firestore';

export class Team {
  constructor(
    readonly tid: string,
    readonly name: string,
    readonly logo: string,
    readonly coachId: string,
    readonly managerId: string
    // readonly played: number,
    // readonly won: number,
    // readonly drawn: number,
    // readonly lost: number,
    // readonly gf: number,
    // readonly ga: number,
    // readonly points: number
  ) { }

  toString(): string {
    return this.name;
  }
}

export type TeamDbModel = {
  name: string;
  logo: string;
  coachId: string;
  managerId: string;
  // played: number;
  // won: number;
  // drawn: number;
  // lost: number;
  // gf: number;
  // ga: number;
  // points: number;
};

export class TeamConverter implements FirestoreDataConverter<Team, TeamDbModel> {
  toFirestore(team: WithFieldValue<Team>): WithFieldValue<TeamDbModel> {
    return {
      name: team.name,
      logo: team.logo,
      coachId: team.coachId,
      managerId: team.managerId,
      // played: team.played,
      // won: team.won,
      // lost: team.lost,
      // drawn: team.drawn,
      // gf: team.gf,
      // ga: team.ga,
      // points: team.points
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot): Team {
    const data = snapshot.data() as TeamDbModel;
    return new Team(
      snapshot.id,
      data.name,
      data.logo,
      data.coachId,
      data.managerId
      // data.played,
      // data.won,
      // data.drawn,
      // data.lost,
      // data.gf,
      // data.ga,
      // data.points
    );
  }
}
