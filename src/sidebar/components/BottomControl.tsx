import { I18nService } from '../services/i18nService'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const BottomControl: React.FC = () => {
  const i18nService = I18nService.getInstance()

  return (
    <div className="flex justify-center">
      <Select
        defaultValue={i18nService.getCurrentLanguage()}
        onValueChange={(value) => i18nService.changeLanguage(value)}
      >
        <SelectTrigger className="w-[80px] justify-center gap-2 text-xs p-1 border-0 shadow-none focus-visible:bg-none focus-visible:ring-0 focus-visible:ring-offset-0">
          <SelectValue placeholder="选择语言" className=" text-xs" />
        </SelectTrigger>
        <SelectContent className=" text-xs">
          <SelectItem value="zh" className="py-1">
            中文
          </SelectItem>
          <SelectItem value="en" className="py-1">
            EN
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default BottomControl
