import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import {IsNotEmpty, IsOptional, Length, MaxLength} from "class-validator";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    @IsOptional()
    id: number

    @Column("nvarchar", {length: 50})
    @Length(1, 50, {message: "First Name must be from 1 to 50 characters"})
    @IsNotEmpty({message: "First name is required"})
    firstName: string

    @Column("nvarchar", {length: 50, nullable: true})
    @MaxLength(50, {message: "Last Name must not be more than 50 characters"})
    @IsOptional()
    lastName: string

    @Column("int", {nullable: false})
    @IsNotEmpty()
    age: number

}
