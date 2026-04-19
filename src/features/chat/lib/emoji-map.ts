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

type EmojiMeta = {
  src: string
  pickerScale: number
  messageScale: number
}

function createEmoji(src: string, pickerScale = 1, messageScale = pickerScale): EmojiMeta {
  return {
    src,
    pickerScale,
    messageScale
  }
}

export const emojiMap = {
  angry_ggamja: createEmoji(angryGgamja, 1),
  burn_ggamja: createEmoji(burnGgamja, 2),
  buy_ggamja: createEmoji(buyGgamja, 1),
  cut_ggamja: createEmoji(cutGgamja, 1),
  down: createEmoji(down, 1.02),
  ee: createEmoji(ee, 1.3),
  fall_ggamja: createEmoji(fallGgamja, 0.98),
  gg_ggamja: createEmoji(ggGgamja, 1),
  goodmorning_ggamja: createEmoji(goodmorningGgamja, 0.94),
  goup_ggamja: createEmoji(goupGgamja, 1),
  idk_ggamja: createEmoji(idkGgamja, 0.95),
  lazy_ggamja: createEmoji(lazyGgamja, 0.96),
  letsgo_ggamja: createEmoji(letsgoGgamja, 1),
  naga_gamja: createEmoji(nagaGamja, 0.98),
  okay_ggamja: createEmoji(okayGgamja, 1),
  sad_ggamja: createEmoji(sadGgamja, 0.98),
  search_ggamja: createEmoji(searchGgamja, 0.9),
  sell_ggamja: createEmoji(sellGgamja, 1),
  sleep_ggamja: createEmoji(sleepGgamja, 0.94),
  sosad_ggamja: createEmoji(sosadGgamja, 0.96),
  thanks_ggamja: createEmoji(thanksGgamja, 1),
  vacation_ggamja: createEmoji(vacationGgamja, 0.94),
  wefini_ggamja: createEmoji(wefiniGgamja, 1.04),
  yeah_ggamja: createEmoji(yeahGgamja, 0.96),
  yessir_ggamja: createEmoji(yessirGgamja, 0.96),
  zz_ggamja: createEmoji(zzGgamja, 0.9)
} as const

export type EmojiCode = keyof typeof emojiMap

export const emojiList = Object.entries(emojiMap).map(([code, emoji]) => ({
  code: code as EmojiCode,
  ...emoji
}))

export function isEmojiCode(value: string): value is EmojiCode {
  return value in emojiMap
}
