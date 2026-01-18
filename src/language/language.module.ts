// src/language/language.module.ts
import { Global, Module } from '@nestjs/common';
import { LanguageService } from './language.service';

@Global()
@Module({
  providers: [LanguageService],
  exports: [LanguageService],
})
export class LanguageModule {}
