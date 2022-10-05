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

export const enum InputNumberInterceptDirectiveProperty {
  /** 已进行过指令初始化。（HTMLInputElement 属性名） */
  DIRECTIVE_INIT = 'numberIntercept',
  /** title 信息显示为错误信息时，对默认 title 的缓存。（HTMLInputElement 属性名） */
  DIRECTIVE_TITLE = 'numberInterceptTitle',
  /** title 信息显示为错误信息时，对取消提示计时器的缓存。（HTMLInputElement 属性名） */
  DIRECTIVE_TIMER = 'numberInterceptTimer',
  /** 全局配置。（app.config.globalProperties 属性名） */
  DIRECTIVE_GLOBAL_PROPTERTY = 'numberInterceptOption',
}
