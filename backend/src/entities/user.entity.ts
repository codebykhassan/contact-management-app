import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Contact } from './contact.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: 'user' })
    role: string; // 'user' or 'admin'

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Contact, contact => contact.user)
    contacts: Contact[];
}