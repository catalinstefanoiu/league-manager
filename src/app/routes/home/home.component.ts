import { Component, OnInit, AfterViewInit, ViewChild, inject } from '@angular/core';
import { TeamsService } from '../../services/teams.service';  // Import the Teams service
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

export interface FootballTeam {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;  // Goals For
  ga: number;  // Goals Against
  gd: number;  // Goal Difference
  points: number;
  logo: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatTableModule, MatSortModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['position', 'team', 'played', 'won', 'drawn', 'lost', 'gf', 'ga', 'gd', 'points'];
  dataSource = new MatTableDataSource<FootballTeam>();

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private teamsService: TeamsService, private _liveAnnouncer: LiveAnnouncer) {}

  ngOnInit(): void {
    this.teamsService.getTeams().subscribe((teams) => {
      console.log(teams);
      this.dataSource.data = teams.map((team, index) => ({
        position: index + 1,  
        team: team.name,      
        played: 0,            
        won: 0,               
        drawn: 0,             
        lost: 0,              
        gf: 0,                
        ga: 0,                
        gd: 0,                
        points: 0,        
        logo: team.logo    
      }));
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
