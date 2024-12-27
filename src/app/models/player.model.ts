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
  ) { }

  toString(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}