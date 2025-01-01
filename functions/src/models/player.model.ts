import { FieldValue, FirestoreDataConverter, QueryDocumentSnapshot, WithFieldValue } from 'firebase-admin/firestore';

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

export interface IPlayerDbModel {
  firstName: string;
  lastName: string;
  age: number;
  position: string;
  teamId: string;
  isCoach: boolean;
  dateStarted: number;
}

export class PlayerConverter implements FirestoreDataConverter<Player, IPlayerDbModel> {
  toFirestore(player: WithFieldValue<Player>): WithFieldValue<IPlayerDbModel> {
    return {
      firstName: player.firstName,
      lastName: player.lastName,
      age: player.age,
      position: player.position,
      teamId: player.teamId,
      isCoach: player.isCoach,
      dateStarted: this._dateStartedToNumber(player.dateStarted)
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot): Player {
    const data = snapshot.data() as IPlayerDbModel;
    return new Player(
      snapshot.id,
      data.firstName,
      data.lastName,
      data.age,
      data.position,
      data.teamId,
      data.isCoach,
      new Date(data.dateStarted)
    );
  }

  _dateStartedToNumber(dateStarted: FieldValue | WithFieldValue<Date>): number | FieldValue {
    if (typeof (dateStarted as Date).getTime === 'function') {
      return (dateStarted as Date).getTime();
    }
    return dateStarted as FieldValue;
  }
}
