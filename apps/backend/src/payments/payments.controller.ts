import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @ApiBody({
    schema: {
      properties: {
        amount: { type: 'number' },
        currency: { type: 'string', default: 'usd' },
        orderId: { type: 'number' },
        customerId: { type: 'number' },
      },
    },
  })
  async createPaymentIntent(@Body() data: {
    amount: number;
    currency?: string;
    orderId?: number;
    customerId?: number;
  }) {
    const metadata: Record<string, string> = {};
    if (data.orderId) metadata.orderId = data.orderId.toString();
    if (data.customerId) metadata.customerId = data.customerId.toString();

    const paymentIntent = await this.paymentsService.createPaymentIntent(
      data.amount,
      data.currency || 'usd',
      metadata,
    );

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  @Get('intent/:id')
  async getPaymentIntent(@Param('id') id: string) {
    const intent = await this.paymentsService.confirmPaymentIntent(id);
    return {
      id: intent.id,
      status: intent.status,
      amount: intent.amount / 100, // Convert from cents
      currency: intent.currency,
    };
  }
}

