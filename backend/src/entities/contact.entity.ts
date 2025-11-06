import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('contacts')
export class Contact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column({ nullable: true })
    photo: string; // File path

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, user => user.contacts)
    user: User;

    @Column()
    userId: number;
}