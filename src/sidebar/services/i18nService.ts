import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { enTranslations } from '../i18n/en'
import { zhTranslations } from '../i18n/zh'

export class I18nService {
  private static instance: I18nService
  private currentLanguage: string = 'zh'

  private constructor() {
    this.initI18n()
    this.loadStoredLanguage()
  }

  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService()
    }
    return I18nService.instance
  }

  private async loadStoredLanguage(): Promise<void> {
    try {
      const result = await chrome.storage.local.get('language')
      if (result.language) {
        await this.changeLanguage(result.language)
      }
    } catch (error) {
      console.error('加载语言设置失败:', error)
    }
  }

  private initI18n(): void {
    i18n.use(initReactI18next).init({
      resources: {
        en: {
          translation: enTranslations,
        },
        zh: {
          translation: zhTranslations,
        },
      },
      lng: this.currentLanguage,
      fallbackLng: 'zh',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
      returnNull: false,
      returnEmptyString: false,
      keySeparator: '.',
      ns: ['translation'],
      defaultNS: 'translation',
    })

    console.log('i18n初始化完成', i18n)
  }

  public async changeLanguage(language: string): Promise<void> {
    try {
      await i18n.changeLanguage(language)
      this.currentLanguage = language
      await chrome.storage.local.set({ language })
    } catch (error) {
      console.error('切换语言失败:', error)
      throw error
    }
  }

  public getCurrentLanguage(): string {
    return this.currentLanguage
  }

  public getTranslation(key: string): string {
    return i18n.t(key)
  }
}
