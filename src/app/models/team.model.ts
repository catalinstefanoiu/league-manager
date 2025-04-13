export class Team {
  constructor(
    readonly tid: string,
    readonly name: string,
    readonly logo: string,
    readonly coachId: string,
    readonly managerId: string,
    readonly played: number,
    readonly won: number,
    readonly drawn: number,
    readonly lost: number,
    readonly gf: number,
    readonly ga: number,
    readonly points: number
  ) { }
}
