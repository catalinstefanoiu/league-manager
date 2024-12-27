import { FirestoreDataConverter, QueryDocumentSnapshot, WithFieldValue } from 'firebase-admin/firestore';

export class Player {
  constructor(
    readonly pid: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly age: number,
    readonly position: string,
    readonly teamId: string,
    readonly isCoach: boolean,
    readonly dateStarted: Date,
  ) { }

  toString(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

export interface PlayerDbModel {
  firstName: string;
  lastName: string;
  age: number;
  position: string;
  teamId: string;
  isCoach: boolean;
  dateStarted: Date;
}

export class PlayerConverter implements FirestoreDataConverter<Player, PlayerDbModel> {
  toFirestore(player: WithFieldValue<Player>): WithFieldValue<PlayerDbModel> {
    return {
      firstName: player.firstName,
      lastName: player.lastName,
      age: player.age,
      position: player.position,
      teamId: player.teamId,
      isCoach: player.isCoach,
      dateStarted: player.dateStarted
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot): Player {
    const data = snapshot.data() as PlayerDbModel;
    return new Player(
      snapshot.id,
      data.firstName,
      data.lastName,
      data.age,
      data.position,
      data.teamId,
      data.isCoach,
      data.dateStarted
    );
  }
}
