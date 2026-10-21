import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConfirmTransferHandler } from '../../business/handlers/transfers/confirm-transfer.handler.js';
import { InitiateTransferHandler } from '../../business/handlers/transfers/initiate-transfer.handler.js';
import { CurrentUser } from '../security/current-user.decorator.js';
import { EncryptedPayloadPipe } from '../security/encrypted-payload.pipe.js';
import {
  type AuthenticatedUser,
  JwtAuthGuard,
} from '../security/jwt-auth.guard.js';
import {
  ConfirmTransferDto,
  InitiateTransferDto,
} from '../validation/transfer.dto.js';

interface ConfirmTransferBody {
  passKey: string;
}

@Controller('transfers')
@UseGuards(JwtAuthGuard)
export class TransfersController {
  constructor(
    private readonly initiateTransferHandler: InitiateTransferHandler,
    private readonly confirmTransferHandler: ConfirmTransferHandler,
  ) {}

  @Post('initiate')
  async initiate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: InitiateTransferDto,
  ) {
    const response = await this.initiateTransferHandler.handle({
      userId: user.id,
      toAccountNumber: dto.toAccountNumber,
      bankCode: dto.bankCode,
      amountKobo: dto.amountKobo,
      idempotencyKey: dto.idempotencyKey,
    });
    return response.data;
  }

  @Post(':id/confirm')
  @HttpCode(200)
  async confirm(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(EncryptedPayloadPipe(ConfirmTransferDto)) body: ConfirmTransferBody,
  ) {
    const response = await this.confirmTransferHandler.handle({
      userId: user.id,
      transactionId: id,
      passKey: body.passKey,
    });
    return response.data;
  }
}
