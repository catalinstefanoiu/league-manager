import { Injectable } from '@angular/core';
import { Firestore, getFirestore, collection, getDocs } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',  // Ensure the service is provided in the root injector
})
export class TeamsService {
  private firestore: Firestore;

  constructor() {
    // Use Angular's inject function to inject Firestore
    this.firestore = inject(Firestore);
  }

  getTeams(): Observable<any[]> {
    const teamsCollection = collection(this.firestore, 'teams');
    return from(
      getDocs(teamsCollection).then(snapshot =>
        snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            logo: data['logo'] || '', // Ensure the logo field is present, even if empty
          };
        })
      )
    );
  }
}
