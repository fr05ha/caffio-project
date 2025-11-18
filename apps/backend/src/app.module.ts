import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { CafesModule } from './cafes/cafes.module';
import { MenusModule } from './menus/menus.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CafesModule,
    MenusModule,
    ReviewsModule,
    AuthModule,
    CustomersModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

