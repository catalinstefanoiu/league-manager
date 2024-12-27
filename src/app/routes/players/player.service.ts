import { inject, Injectable } from '@angular/core';
import { collection, Firestore, FirestoreDataConverter, getDocs, query, QueryDocumentSnapshot, where, WithFieldValue } from '@angular/fire/firestore';
import { Player } from '../../models/player.model';


export interface IPlayerDbModel {
  firstName: string;
  lastName: string;
  age: number;
  position: string;
  teamId: string;
  isCoach: boolean;
  dateStarted: Date;
}



@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private firestore = inject(Firestore);

  public async getPlayers(teamId: string): Promise<Player[]> {
    const players: Player[] = [];
    const col = collection(this.firestore, 'players');
    let querySnapshot;
    if (!teamId) {
      querySnapshot = await getDocs(col.withConverter(new PlayerConverter()));
    } else {
      const q = query(col, where('teamId', '==', teamId));
      querySnapshot = await getDocs(q.withConverter(new PlayerConverter()));
    }
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      players.push(data);
    });
    return players;
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
      isCoach: player.isCoach,
      dateStarted: player.dateStarted
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
      data.dateStarted
    );
  }
}

