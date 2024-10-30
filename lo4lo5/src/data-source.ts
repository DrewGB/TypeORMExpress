import "reflect-metadata"
import { DataSource } from 'typeorm';
import { User } from './entity/User'; // Adjust the import path as necessary
import { Student } from "./entity/Student";

export const AppDataSource = new DataSource({
    type: 'sqlite', // e.g., 'mysql', 'postgres', etc.
    database: './database.sqlite',
    synchronize: true,
    logging: false,
    entities: [User, Student], // If entity is not listed here table will NOT be created
    migrations: [], // Add your migration files here
    subscribers: [], // Add your subscriber files here
});
