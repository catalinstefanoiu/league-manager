import { inject, Injectable } from '@angular/core';
import {
  collection, doc, FieldValue, Firestore, FirestoreDataConverter,
  getDocs, query, QueryDocumentSnapshot, setDoc, where, WithFieldValue,
  writeBatch
} from '@angular/fire/firestore';
import { Player } from '../../models/player.model';


export interface IPlayerDbModel {
  firstName: string;
  lastName: string;
  age: number;
  position: string;
  teamId: string;
  isCoach: boolean;
  dateStarted: number;
  transferable: boolean;
}

const COL_NAME = 'players';


@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private firestore = inject(Firestore);

  public async getPlayers(teamId: string): Promise<Player[]> {
    const players: Player[] = [];
    const col = collection(this.firestore, COL_NAME);
    let querySnapshot;
    if (!teamId) {
      querySnapshot = await getDocs(col.withConverter(new PlayerConverter()));
    } else {
      const q = query(col, where('teamId', '==', teamId));
      querySnapshot = await getDocs(q.withConverter(new PlayerConverter()));
    }
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      players.push(data as Player);
    });
    return players;
  }

  public async updatePlayer(player: Player): Promise<void> {
    const playerRef = doc(this.firestore, COL_NAME, player.pid).withConverter(new PlayerConverter());
    await setDoc(playerRef, player);
  }

  public async allocatePlayers(players: Player[]): Promise<void> {
    const batch = writeBatch(this.firestore);
    players.forEach((player) => {
      const playerRef = doc(this.firestore, COL_NAME, player.pid);
      batch.set(playerRef, {
        firstName: player.firstName,
        lastName: player.lastName,
        age: player.age,
        position: player.position,
        teamId: player.teamId,
        isCoach: player.isCoach ?? false,
        dateStarted: player.dateStarted.getTime()
      });
    })
    await batch.commit();
  }
}

export class PlayerConverter implements FirestoreDataConverter<Player, IPlayerDbModel> {
  toFirestore(player: WithFieldValue<Player>): WithFieldValue<IPlayerDbModel> {
    return {
      firstName: player.firstName,
      lastName: player.lastName,
      age: player.age,
      position: player.position,
      teamId: player.teamId,
      isCoach: player.isCoach ?? false,
      dateStarted: this._dateStartedToNumber(player.dateStarted),
      transferable: player.transferable ?? false
    };
  }

  fromFirestore(snapshot: QueryDocumentSnapshot): Player {
    const data = snapshot.data() as IPlayerDbModel;
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
      data.transferable
    );
  }

  _dateStartedToNumber(dateStarted: FieldValue | WithFieldValue<Date>): number | FieldValue {
    if (typeof (dateStarted as Date).getTime === 'function') {
      return (dateStarted as Date).getTime();
    }
    return dateStarted as FieldValue;
  }
}

