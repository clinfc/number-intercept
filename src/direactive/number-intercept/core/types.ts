import { WatchStopHandle } from 'vue'
import InputNumberInterceptHistory from './history'

export type TxtRange = {
  start: number
  end: number
  collapsed: boolean
}

export type HistoryState = {
  text: string
  range: TxtRange
}

export type InputNumberInterceptDirectiveValue = {
  /** 数字类型。integer：只允许输入整数；float：可以输入浮点数。默认值：float。 */
  mode?: 'integer' | 'float'
  /** 最小值 */
  min?: number
  /**
   * 最小值校验失败的处理方式。默认值：stop。
   * none：不做任何处理；
   * stop：取消最后一次输入；
   * clear：清空输入框；
   * minValue：设置为最小值
   * callback：自定义回调函数
   */
  minFail?: 'none' | 'stop' | 'clear' | 'minValue' | ((value: number) => number | undefined)
  /** 最大值 */
  max?: number
  /**
   * 最大值校验失败的处理方式。默认值：stop。
   * none：不做任何处理；
   * stop：取消最后一次输入；
   * clear：清空输入框；
   * maxValue：设置为最大值
   * callback：自定义回调函数
   */
  maxFail?: 'none' | 'stop' | 'clear' | 'maxValue' | ((value: number) => number | undefined)
  /** 数据长度限制：整数位数 */
  integer?: number
  /** 数据长度限制：小数位数 */
  decimals?: number
  /** 数据长度限制：总位数 */
  length?: number
}

export type InputNumberInterceptDirectiveConfig = Required<InputNumberInterceptDirectiveValue> & {
  /** 需要进行最小值校验 */
  verifyMin: boolean
  /** 需要进行最大值校验 */
  verifyMax: boolean
  /** 运行输入负号 */
  minusSign: boolean
  /** 允许小数点 */
  decimalPoint: boolean
}

export interface HTMLInputNumberInterceptElement extends HTMLInputElement {
  /** 已进行过指令初始化 */
  numberIntercept?: boolean
  /** 合并后的配置对象 */
  numberInterceptConfig?: InputNumberInterceptDirectiveConfig
  /** watchEffect 句柄 */
  numberInterceptHandle?: WatchStopHandle
  /** 历史记录 */
  numberInterceptHistory?: InputNumberInterceptHistory<HistoryState>
}
