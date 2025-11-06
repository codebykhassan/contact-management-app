import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
    constructor(
        @InjectRepository(Contact)
        private contactRepository: Repository<Contact>,
    ) { }

    // Create a new contact
    async create(userId: number, createContactDto: CreateContactDto) {
        const contact = this.contactRepository.create({
            ...createContactDto,
            userId,
        });
        return await this.contactRepository.save(contact);
    }

    // Get all contacts for a user (with pagination and search)
    async findAll(
        userId: number,
        role: string,
        page: number = 1,
        limit: number = 10,
        search?: string,
        sortBy: string = 'createdAt',
        sortOrder: 'ASC' | 'DESC' = 'DESC',
    ) {
        const query = this.contactRepository.createQueryBuilder('contact');

        // If user is not admin, only show their contacts
        if (role !== 'admin') {
            query.where('contact.userId = :userId', { userId });
        }

        // Search functionality
        if (search) {
            query.andWhere(
                '(contact.name LIKE :search OR contact.email LIKE :search)',
                { search: `%${search}%` },
            );
        }

        // Sorting
        query.orderBy(`contact.${sortBy}`, sortOrder);

        // Pagination
        const skip = (page - 1) * limit;
        query.skip(skip).take(limit);

        // Execute query
        const [contacts, total] = await query.getManyAndCount();

        return {
            data: contacts,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // Get a single contact by ID
    async findOne(id: number, userId: number, role: string) {
        const contact = await this.contactRepository.findOne({ where: { id } });

        if (!contact) {
            throw new NotFoundException('Contact not found');
        }

        // Check ownership (unless admin)
        if (role !== 'admin' && contact.userId !== userId) {
            throw new ForbiddenException('You can only access your own contacts');
        }

        return contact;
    }

    // Update a contact
    async update(id: number, userId: number, role: string, updateContactDto: UpdateContactDto) {
        const contact = await this.findOne(id, userId, role);

        Object.assign(contact, updateContactDto);
        return await this.contactRepository.save(contact);
    }

    // Delete a contact
    async remove(id: number, userId: number, role: string) {
        const contact = await this.findOne(id, userId, role);
        await this.contactRepository.remove(contact);
        return { message: 'Contact deleted successfully' };
    }
}