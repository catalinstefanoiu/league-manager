import { FirestoreDataConverter, QueryDocumentSnapshot, WithFieldValue } from 'firebase-admin/firestore';

export class Player {
  constructor(
    readonly pid: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly teamId: string
  ) { }

  toString(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

export interface PlayerDbModel {
  firstName: string;
  lastName: string;
  teamId: string;
}

export class PlayerConverter implements FirestoreDataConverter<Player, PlayerDbModel> {
  toFirestore(player: WithFieldValue<Player>): WithFieldValue<PlayerDbModel> {
    return {
      firstName: player.firstName,
      lastName: player.lastName,
      teamId: player.teamId
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot): Player {
    const data = snapshot.data() as PlayerDbModel;
    return new Player(snapshot.id, data.firstName, data.lastName, data.teamId);
  }
}
