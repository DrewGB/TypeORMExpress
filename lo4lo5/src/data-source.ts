import "reflect-metadata"
import { DataSource } from 'typeorm';
import { User } from './entity/User'; // Adjust the import path as necessary

export const AppDataSource = new DataSource({
    type: 'sqlite', // e.g., 'mysql', 'postgres', etc.
    database: './database.sqlite',
    synchronize: true,
    logging: false,
    entities: [User],
    migrations: [], // Add your migration files here
    subscribers: [], // Add your subscriber files here
});
