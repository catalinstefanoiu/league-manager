import { FieldValue, FirestoreDataConverter, QueryDocumentSnapshot, WithFieldValue } from 'firebase-admin/firestore';

export class Player {
  constructor(
    readonly pid: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly displayName: string,
    readonly age: number,
    readonly position: string,
    readonly teamId: string,
    readonly isCoach: boolean,
    readonly dateStarted: Date,
    readonly transferable: boolean,
    readonly transferReqs?: TransferRequest[]
  ) { }

  toString(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

export class TransferRequest {
  constructor(
    readonly teamId: string,
    readonly timestamp: Date
  ) { }
}

export type PlayerDbModel = {
  firstName: string;
  lastName: string;
  age: number;
  position: string;
  teamId: string;
  isCoach: boolean;
  dateStarted: number;
  transferable: boolean;
  transferReqs?: Array<{
    teamId: string;
    timestamp: number;
  }>;
};

export class PlayerConverter implements FirestoreDataConverter<Player, PlayerDbModel> {
  toFirestore(player: WithFieldValue<Player>): WithFieldValue<PlayerDbModel> {
    return {
      firstName: player.firstName,
      lastName: player.lastName,
      age: player.age,
      position: player.position,
      teamId: player.teamId,
      isCoach: player.isCoach,
      dateStarted: this._dateToNumber(player.dateStarted),
      transferable: player.transferable,
      transferReqs: Array.isArray(player.transferReqs) && player.transferReqs?.map((r) => {
        return {
          teamId: (r as TransferRequest).teamId,
          timestamp: this._dateToNumber((r as TransferRequest).timestamp)
        };
      }) || undefined
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot): Player {
    const data = snapshot.data() as PlayerDbModel;
    let transferReqs;
    if (data.transferReqs) {
      transferReqs = data.transferReqs.map((r) => {
        return {
          teamId: r.teamId,
          timestamp: new Date(r.timestamp)
        };
      });
    }
    return new Player(
      snapshot.id,
      data.firstName,
      data.lastName,
      `${data.firstName} ${data.lastName}`,
      data.age,
      data.position,
      data.teamId,
      data.isCoach,
      new Date(data.dateStarted),
      data.transferable,
      transferReqs
    );
  }

  _dateToNumber(date: FieldValue | WithFieldValue<Date>): number | FieldValue {
    if (typeof (date as Date).getTime === 'function') {
      return (date as Date).getTime();
    }
    return date as FieldValue;
  }
}
