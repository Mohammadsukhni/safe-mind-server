import { PrismaService } from 'src/prisma.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { contact_us } from './entity/contact-us';
import { Prisma } from '@prisma/client';
import { filterConverter } from 'src/utils/helpers/filter.helper';
import { Response } from 'express';
import { Account } from 'src/account/entities/account-entity';
import { CurrentAccount } from 'src/utils/decorators/account.decorator';
import { ApiHeaders } from 'src/utils/decorators/header.decorator';
import { CustomAuthGuard } from 'src/utils/guards/auth.guard';

@ApiTags('Contact Us Controller')
@Controller('contact-us')
@ApiHeaders()
export class ContactUsController {
  constructor(
    private readonly contactUsService: ContactUsService,
    private readonly prismaService: PrismaService,
  ) {}

  @UseGuards(CustomAuthGuard)
  @ApiSecurity('bearer')
  @Post()
  @ApiOperation({
    summary: 'Create a Contact Us record',
    description: 'Creates a new Contact Us record in the system',
  })
  @ApiCreatedResponse({ type: contact_us })
  async create(
    @Body() createContactUsDto: CreateContactUsDto,
    @CurrentAccount() account: Account,
  ): Promise<contact_us> {
    return this.contactUsService.create(createContactUsDto, account);
  }

  @UseGuards(CustomAuthGuard)
  @ApiSecurity('bearer')
  @Get()
  @ApiOperation({
    summary: 'Get multiple Contact Us records',
    description: 'Fetches multiple Contact Us records with optional filters',
  })
  @ApiCreatedResponse({ type: [contact_us] })
  @ApiQuery({ name: 'page', type: Number, example: '1' })
  @ApiQuery({ name: 'pageSize', type: Number, example: '10' })
  async findAll(
    @Res() res: Response,
    @Query()
    {
      page,
      pageSize,
      ...filter
    }: Prisma.contact_usWhereInput & {
      page: number;
      pageSize: number;
    },
    @CurrentAccount() account: Account,
  ) {
    filter = filterConverter(filter);

    const data = await this.prismaService.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        res.set(
          'x-total-count',
          `${await prisma.contact_us.count({
            where: {
              ...filter,
            },
          })}`,
        );

        return this.contactUsService.findAll(
          prisma,
          filter,
          page,
          pageSize,
          account,
        );
      },
      {
        maxWait: 3000,
        timeout: 3000,
      },
    );
    res.send(data);
    return data;
  }

  @UseGuards(CustomAuthGuard)
  @ApiSecurity('bearer')
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a Contact Us record',
    description: 'Updates the details of an existing Contact Us record',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiCreatedResponse({ type: contact_us })
  async update(
    @Param('id') id: number,
    @Body() updateContactUsDto: UpdateContactUsDto,
    @CurrentAccount() account: Account,
  ): Promise<contact_us> {
    return this.contactUsService.update(id, updateContactUsDto, account);
  }

  @UseGuards(CustomAuthGuard)
  @ApiSecurity('bearer')
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a Contact Us record',
    description: 'Deletes an existing Contact Us record by its ID',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiCreatedResponse({ type: contact_us })
  async delete(
    @Param('id') id: number,
    @CurrentAccount() account: Account,
  ): Promise<contact_us> {
    return this.contactUsService.delete(id, account);
  }
}
