import 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    meals: {
      id: string;
      userId: string;
      name: string;
      description: string;
      date: string;
      isOnDiet: boolean;
    }
  }
}
