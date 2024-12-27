import { inject, Injectable } from '@angular/core';
import { collection, Firestore, FirestoreDataConverter, getDocs, QueryDocumentSnapshot, WithFieldValue } from '@angular/fire/firestore';
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

  public async getPlayers(): Promise<Player[]> {
    const players: Player[] = [];
    const querySnapshot = await getDocs(collection(this.firestore, 'players').withConverter(new PlayerConverter()));
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

