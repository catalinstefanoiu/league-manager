import { FirestoreDataConverter, QueryDocumentSnapshot, WithFieldValue } from 'firebase-admin/firestore';

export class Team {
  constructor(
    readonly tid: string,
    readonly name: string,
    readonly coachId: string,
    readonly managerId: string
  ) { }

  toString(): string {
    return this.name;
  }
}

export interface TeamDbModel {
  name: string;
  coachId: string;
  managerId: string;
}

export class TeamConverter implements FirestoreDataConverter<Team, TeamDbModel> {
  toFirestore(team: WithFieldValue<Team>): WithFieldValue<TeamDbModel> {
    return {
      name: team.name,
      coachId: team.coachId,
      managerId: team.managerId
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot): Team {
    const data = snapshot.data() as TeamDbModel;
    return new Team(snapshot.id, data.name, data.coachId, data.managerId);
  }
}
