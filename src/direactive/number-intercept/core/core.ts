import { App, DirectiveBinding, isProxy, reactive, watchEffect } from 'vue'
import InputNumberInterceptHistory from './history'
import {
  HistoryState,
  HTMLInputNumberInterceptElement,
  InputNumberInterceptDirectiveConfig,
  InputNumberInterceptDirectiveValue,
  TxtRange,
} from './types'

const GLOBAL_PROPTERTY = 'numberInterceptOption'

const descriptor = Reflect.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value') as {
  get(): string
  set(value: string): void
}

function getSelectionRange(elem: HTMLInputElement): TxtRange {
  const { selectionStart, selectionEnd } = elem
  const start = Math.min(selectionStart!, selectionEnd!)
  const end = Math.max(selectionStart!, selectionEnd!)
  const collapsed = start == end

  return { start, end, collapsed }
}

function setSelectionRange(elem: HTMLInputElement, start: number, end: number) {
  if (elem === document.activeElement) {
    elem.setSelectionRange(start, end)
  }
}

function initConfig(
  input: HTMLInputNumberInterceptElement,
  binding: DirectiveBinding<InputNumberInterceptDirectiveValue>
) {
  const globalValue = binding.instance?.$.appContext.config.globalProperties[GLOBAL_PROPTERTY]

  const config = reactive(input.numberInterceptConfig ?? ({} as InputNumberInterceptDirectiveConfig))

  const oldConfig = JSON.stringify(config)

  input.numberInterceptConfig = config

  input.numberInterceptHandle?.()

  input.numberInterceptHandle = watchEffect(() => {
    const option = { ...globalValue, ...binding.value }

    const mode: InputNumberInterceptDirectiveConfig['mode'] = option.mode === 'integer' ? 'integer' : 'float'

    const decimalPoint = mode == 'float'

    const min = decimalPoint ? parseFloat(String(option.min)) : parseInt(String(option.min))

    const max = decimalPoint ? parseFloat(String(option.max)) : parseInt(String(option.max))

    const integer = parseInt(String(option.integer))

    const decimals = parseInt(String(option.decimals))

    const length = parseInt(String(option.length))

    const minFail = (
      typeof option.minFail === 'function' || /^(none|stop|clear|minValue)$/.test(option.minFail!)
        ? option.minFail
        : 'stop'
    ) as InputNumberInterceptDirectiveConfig['minFail']

    const maxFail = (
      typeof option.maxFail === 'function' || /^(none|stop|clear|maxValue)$/.test(option.maxFail!)
        ? option.maxFail
        : 'stop'
    ) as InputNumberInterceptDirectiveConfig['maxFail']

    Object.assign(config, {
      mode,
      min,
      max,
      minFail,
      maxFail,
      verifyMin: !isNaN(min),
      verifyMax: !isNaN(max),
      integer: isNaN(integer) || integer < 0 ? 0 : integer,
      decimals: isNaN(decimals) || decimals < 0 ? 0 : decimals,
      length: isNaN(length) || length < 0 ? 0 : length,
      minusSign: !isNaN(min) && min < 0,
    })

    // ???????????? ??? ???????????????????????? ??? ????????????????????????
    config.decimalPoint = mode == 'float' && (isNaN(decimals) || !!decimals)
  })

  if (oldConfig !== JSON.stringify(config)) {
    input.numberInterceptHistory?.clear()
  }

  return config
}

function initialize(el: HTMLElement, binding: DirectiveBinding<InputNumberInterceptDirectiveValue>) {
  const input = (el instanceof HTMLInputElement ? el : el.querySelector('input')) as HTMLInputNumberInterceptElement

  if (!input) return

  const config = initConfig(input, binding)

  // ??????????????????????????????????????????????????????initConfig ?????????????????????????????????????????????
  if (input.numberIntercept) return

  input.setAttribute('type', 'text')
  input.numberIntercept = true

  /**
   * ????????????
   */
  const history = new InputNumberInterceptHistory<HistoryState>()
  input.numberInterceptHistory = history

  // ???????????????????????????
  const range = getSelectionRange(input)
  const firstState = replaceRangeText(input.value, '', range.start, range.end, true) ?? {
    text: '',
    range: { start: 0, end: 0, collapsed: true },
  }
  changeState(firstState, true)

  Reflect.defineProperty(input, 'value', {
    configurable: true,
    enumerable: true,
    get() {
      return descriptor.get.call(input)
    },
    set(v: string) {
      const current = history.current()
      if (current?.text == v) {
        return descriptor.set.call(input, v)
      }
      if (current?.text.endsWith('.') && v === history.before()?.text) {
        v = current!.text.slice(0, -1)
      }
      const state = replaceRangeText('', v, 0, input.value.length, true)
      changeState(state, true)
    },
  })

  function updateValue(value: string) {
    if (/(^-$|\.$)/.test(value)) return

    const event = InputEvent ? new InputEvent('input', { data: value }) : new Event('input')
    input!.dispatchEvent(event)
  }

  /**
   * ?????? history
   * @param state ??????????????????
   * @param save ??? state ????????????
   */
  function changeState(state: HistoryState | string | void, save: boolean = false) {
    if (state === undefined) return
    if (typeof state === 'string') {
      state = { text: state, range: { start: state.length, end: state.length, collapsed: true } }
    }
    const current = history.current()

    if (state.text !== current?.text || input.value !== state.text) {
      descriptor.set.call(input, state.text)
      setSelectionRange(input, state!.range.start, state!.range.end)
      updateValue(state.text)
    }

    save && history.append(state)
  }

  /**
   * ????????????
   * @param sourceText ???????????????
   * @param repalceText ??????????????????
   * @param start ??????????????????
   * @param end ??????????????????
   * @param forcible ????????????
   */
  function replaceRangeText(
    sourceText: string,
    repalceText: string,
    start: number,
    end: number,
    forcible = false
  ): HistoryState | void {
    const hasMinusSign = sourceText.includes('-')
    const hasDecimalPoint = sourceText.includes('.')
    const decimalPointIndex = sourceText.split('').indexOf('.')

    let text = ''

    if (!repalceText) {
      text = `${sourceText.slice(0, start)}${sourceText.slice(end)}`
    } else {
      if (repalceText === '-') {
        if (hasMinusSign || start || (config.verifyMin && config.min > 0)) {
          return
        }
      } else if (repalceText === '.') {
        if (!start || (hasDecimalPoint && start > decimalPointIndex)) {
          return
        }
      } else {
        if (!/(^-?\d|^\.\d)/.test(repalceText)) {
          return
        }

        const numberRegEXP = /^\d+$/

        if (!numberRegEXP.test(repalceText)) {
          const chars: string[] = []

          for (let i = 0; i < repalceText.length; i++) {
            const txt = repalceText[i]

            if (txt === '-') {
              // ?????????????????? && ?????????????????????????????? && (????????????????????? || (??????????????????????????? && ???????????????))
              if (config.minusSign && !i && (!hasMinusSign || (!start && end))) {
                chars.push(txt)
                continue
              } else break
            }

            if (txt === '.') {
              // ????????????????????? && (???????????????????????? || ??????????????????????????????????????????)
              if (
                config.decimalPoint &&
                (!hasDecimalPoint || (decimalPointIndex >= start && decimalPointIndex <= end))
              ) {
                // ????????????????????????????????????????????????
                if (chars.includes(txt)) break
                // ????????????????????? || ?????????????????????????????????????????????????????????????????????
                if (start || chars.length) {
                  chars.push(txt)
                  continue
                }
              }
              // ???????????????????????????
              break
            }

            if (numberRegEXP.test(txt)) {
              chars.push(txt)
              continue
            }

            break
          }

          if (!chars.length) return

          repalceText = chars.join('')
        }
      }

      text = `${sourceText.slice(0, start)}${repalceText}${sourceText.slice(end)}`
    }

    const match = text.match(/(^-?)(\d+)(\.?)(\d*)/)

    if (match) {
      let [sign, integer, point, decimals] = match.slice(1)

      // ??????????????? '0'
      if (integer.length > 1) {
        integer = integer.replace(/^0*/, '') || '0'
      }

      if (config.integer && integer.length > config.integer) {
        if (forcible || (hasDecimalPoint && start < decimalPointIndex && end > decimalPointIndex)) {
          // loginfo(`????????????????????????????????? ${config.integer} ??????????????????????????????`)
          integer = integer.slice(-config.integer)
        } else if (repalceText) {
          // loginfo(`????????????????????????????????? ${config.integer} ?????????????????????`)
          return
        }
      }

      if (config.mode === 'integer') {
        point = ''
        decimals = ''
      }

      if (config.decimals && decimals.length > config.decimals) {
        if (forcible || !hasDecimalPoint || start <= decimalPointIndex) {
          // loginfo(`????????????????????????????????? ${config.decimals} ??????????????????????????????`)
          decimals = decimals.slice(0, config.decimals)
        } else if (repalceText) {
          // loginfo(`????????????????????????????????? ${config.decimals} ?????????????????????`)
          return
        }
      }

      text = [sign, integer, point, decimals].join('')
    }

    if (text && (config.verifyMin || config.verifyMax)) {
      const num = parseFloat(text)

      if (num < config.min && config.min < 0) {
        switch (config.minFail) {
          case 'none':
            break
          case 'stop':
            // loginfo(`?????????????????????????????????${config.min}??????????????????`)
            return
          case 'clear':
            text = ''
            break
          case 'minValue':
            text = String(config.min)
            break
          default: {
            const result = String(config.minFail(num))
            const n = parseFloat(result)
            text = isNaN(n) ? '' : result
            break
          }
        }
      } else if (num > config.max) {
        switch (config.maxFail) {
          case 'none':
            break
          case 'stop':
            // loginfo(`?????????????????????????????????${config.max}??????????????????`)
            return
          case 'clear':
            text = ''
            break
          case 'maxValue':
            text = String(config.max)
            break
          default: {
            const result = String(config.maxFail(num))
            const n = parseFloat(result)
            text = isNaN(n) ? '' : result
            break
          }
        }
      }
    }

    const range: TxtRange = {
      start: start + repalceText.length,
      end: start + repalceText.length,
      collapsed: true,
    }

    return { text, range }
  }

  /**
   * beforeinput ??????
   * @param e
   */
  function onBeforeinput(e: InputEvent) {
    e.preventDefault()

    const range = getSelectionRange(input)

    let state: HistoryState | void

    if (e.isComposing) {
      if (range.collapsed) return
      state = replaceRangeText(input.value, '', range.start, range.end, true)
    } else {
      switch (e.inputType) {
        // ????????????
        case 'insertText':
        // ??????
        case 'insertFromPaste': {
          state = replaceRangeText(input.value, e.data!, range.start, range.end)
          break
        }
        // backspace
        case 'deleteContentBackward': {
          state = replaceRangeText(input.value, '', range.collapsed ? range.start - 1 : range.start, range.end)
          break
        }
        // delete
        case 'deleteContentForward': {
          state = replaceRangeText(input.value, '', range.start, range.collapsed ? range.end + 1 : range.end)
          break
        }
        // ??????
        case 'deleteByCut': {
          state = replaceRangeText(input.value, '', range.start, range.end)
          break
        }
      }
    }

    changeState(state, true)
  }

  /**
   * ??????????????????
   */
  function onCompositionend() {
    const state = history.current()
    requestAnimationFrame(() => changeState(state))
  }

  function onBlur() {
    const before = history.before()
    const current = history.current()

    // ??????????????????
    if (current) {
      if (current.text === '-') {
        if (before?.text) {
          changeState('', true)
        } else {
          changeState(history.prev())
          history.clip()
        }
        return
      }
      if (current.text.endsWith('.')) {
        const text = current.text.slice(0, -1)
        if (text === before?.text) {
          changeState(history.prev())
          history.clip()
        } else {
          history.prev()
          changeState(text, true)
        }
        return
      }
    }
  }

  /**
   * ctrl + z ??? ctrl + shift + z
   * @param e
   */
  function onKeydown(e: KeyboardEvent) {
    if (e.keyCode !== 90 || !e.ctrlKey) return

    e.preventDefault()
    const state = e.shiftKey ? history.next() : history.prev()
    changeState(state)
  }

  input.addEventListener('beforeinput', onBeforeinput)
  input.addEventListener('compositionend', onCompositionend)
  input.addEventListener('keydown', onKeydown)
  input.addEventListener('blur', onBlur)
}

export function numberInterceptDirective(app: App, option: InputNumberInterceptDirectiveValue = {}) {
  app.directive('number-intercept', {
    created: initialize,
    updated: initialize,
  })
  app.config.globalProperties[GLOBAL_PROPTERTY] = option
}
