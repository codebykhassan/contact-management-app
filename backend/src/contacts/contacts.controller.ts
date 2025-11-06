import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('contacts')
@UseGuards(AuthGuard('jwt')) // Protect all routes with JWT authentication
export class ContactsController {
    constructor(private contactsService: ContactsService) { }

    @Post()
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                    return cb(new Error('Only image files are allowed!'), false);
                }
                cb(null, true);
            },
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        }),
    )
    create(
        @Request() req,
        @Body() createContactDto: CreateContactDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (file) {
            createContactDto.photo = `/uploads/${file.filename}`;
        }
        return this.contactsService.create(req.user.userId, createContactDto);
    }

    @Get()
    findAll(
        @Request() req,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    ) {
        return this.contactsService.findAll(
            req.user.userId,
            req.user.role,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 10,
            search,
            sortBy || 'createdAt',
            sortOrder || 'DESC',
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.contactsService.findOne(+id, req.user.userId, req.user.role);
    }

    @Put(':id')
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                    return cb(new Error('Only image files are allowed!'), false);
                }
                cb(null, true);
            },
            limits: { fileSize: 5 * 1024 * 1024 },
        }),
    )
    update(
        @Param('id') id: string,
        @Request() req,
        @Body() updateContactDto: UpdateContactDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (file) {
            updateContactDto.photo = `/uploads/${file.filename}`;
        }
        return this.contactsService.update(+id, req.user.userId, req.user.role, updateContactDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.contactsService.remove(+id, req.user.userId, req.user.role);
    }
}