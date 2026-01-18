// src/services/language.service.ts
import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import * as en from '../../lib/lang/en.json';
import * as ar from '../../lib/lang//ar.json';
import * as ckb from '../../lib/lang//ckb.json';
import { ClsValues } from 'src/core/core.module';

export type Language = 'en' | 'ar' | 'ckb';

@Injectable()
export class LanguageService {
  constructor(private readonly cls: ClsService<ClsValues>) {}

  // this return the json object of the language texts
  //should not be any
  getText(force_lang?: Language): typeof en {
    let lang = '';
    if (!force_lang) lang = this.cls.get('lang') || 'en';
    else lang = force_lang;
    return lang === 'ar' ? ar : lang === 'ckb' ? ckb : en;
  }

  getCurrentLanguage(): Language {
    return this.cls.get('lang') || 'en';
  }

  getValidationMessage(validationKey: string): string {
    const lang = this.cls.get('lang') || 'en';
    const messages =
      lang === 'ar'
        ? ar.validation
        : lang === 'ckb'
          ? ckb.validation
          : en.validation;

    const parts = validationKey.split('.');

    let current = messages;
    for (const part of parts) {
      current = current[part];
      if (current === undefined) {
        return validationKey;
      }
    }

    return String(current);
  }
}
