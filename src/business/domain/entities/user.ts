export interface UserProps {
  id: string;
  firstName: string;
  lastName: string;
}

export class User {
  constructor(public readonly props: UserProps) {}

  get id() {
    return this.props.id;
  }

  fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }
}
