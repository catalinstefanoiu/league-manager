export class Player {
  constructor(
    readonly pid: string,
    public firstName: string,
    public lastName: string,
    public displayName: string,
    public age: number,
    public position: string,
    public teamId: string,
    public isCoach: boolean,
    public dateStarted: Date,
    public transferable: boolean
  ) { }

  toString(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

export function getPlayerPositions(): string[] {
  return [
    'Portar',
    'Fundaș stânga',
    'Fundaș dreapta',
    'Fundaș central',
    'Mijlocaș stânga',
    'Mijlocaș dreapta',
    'Mijlocaș central',
    'Extremă stânga',
    'Extremă dreapta',
    'Atacant',
  ];
}