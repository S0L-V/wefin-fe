import angryGgamja from '@/features/chat/emoji/angry_ggamja.png'
import burnGgamja from '@/features/chat/emoji/burn_ggamja.png'
import buyGgamja from '@/features/chat/emoji/buy_ggamja.png'
import cutGgamja from '@/features/chat/emoji/cut_ggamja.png'
import down from '@/features/chat/emoji/down.png'
import ee from '@/features/chat/emoji/ee.png'
import fallGgamja from '@/features/chat/emoji/fall_ggamja.png'
import ggGgamja from '@/features/chat/emoji/gg_ggamja.png'
import goodmorningGgamja from '@/features/chat/emoji/goodmorning_ggamja.png'
import goupGgamja from '@/features/chat/emoji/goup_ggamja.png'
import idkGgamja from '@/features/chat/emoji/idk_ggamja.png'
import lazyGgamja from '@/features/chat/emoji/lazy_ggamja.png'
import letsgoGgamja from '@/features/chat/emoji/letsgo_ggamja.png'
import nagaGamja from '@/features/chat/emoji/naga_gamja.png'
import okayGgamja from '@/features/chat/emoji/okay_ggamja.png'
import sadGgamja from '@/features/chat/emoji/sad_ggamja.png'
import searchGgamja from '@/features/chat/emoji/search_ggamja.png'
import sellGgamja from '@/features/chat/emoji/sell_ggamja.png'
import sleepGgamja from '@/features/chat/emoji/sleep_ggamja.png'
import sosadGgamja from '@/features/chat/emoji/sosad_ggamja.png'
import thanksGgamja from '@/features/chat/emoji/thanks_ggamja.png'
import vacationGgamja from '@/features/chat/emoji/vacation_ggamja.png'
import wefiniGgamja from '@/features/chat/emoji/wefini_ggamja.png'
import yeahGgamja from '@/features/chat/emoji/yeah_ggamja.png'
import yessirGgamja from '@/features/chat/emoji/yessir_ggamja.png'
import zzGgamja from '@/features/chat/emoji/zz_ggamja.png'

export const emojiMap = {
  angry_ggamja: angryGgamja,
  burn_ggamja: burnGgamja,
  buy_ggamja: buyGgamja,
  cut_ggamja: cutGgamja,
  down,
  ee,
  fall_ggamja: fallGgamja,
  gg_ggamja: ggGgamja,
  goodmorning_ggamja: goodmorningGgamja,
  goup_ggamja: goupGgamja,
  idk_ggamja: idkGgamja,
  lazy_ggamja: lazyGgamja,
  letsgo_ggamja: letsgoGgamja,
  naga_gamja: nagaGamja,
  okay_ggamja: okayGgamja,
  sad_ggamja: sadGgamja,
  search_ggamja: searchGgamja,
  sell_ggamja: sellGgamja,
  sleep_ggamja: sleepGgamja,
  sosad_ggamja: sosadGgamja,
  thanks_ggamja: thanksGgamja,
  vacation_ggamja: vacationGgamja,
  wefini_ggamja: wefiniGgamja,
  yeah_ggamja: yeahGgamja,
  yessir_ggamja: yessirGgamja,
  zz_ggamja: zzGgamja
} as const

export type EmojiCode = keyof typeof emojiMap

export const emojiList = Object.entries(emojiMap).map(([code, src]) => ({
  code: code as EmojiCode,
  src
}))

export function isEmojiCode(value: string): value is EmojiCode {
  return value in emojiMap
}
