/**
 * 特殊链表（数据尾插入、插入前自动清理指针后边的数据、插入后指针永远定位于最后一位元素、可限制链表长度、指针双向移动）
 */
export default class InputNumberInterceptHistory<T> {
  /**
   * 链表数据
   */
  protected data: T[] = []

  /**
   * 链表最大长度，零表示长度不限
   */
  protected max: number = 0

  /**
   * 指针
   */
  protected point = 0

  /**
   * 当前指针是否人为操作过
   */
  protected isRe = false

  /**
   * 当前链表的长度
   */
  get size() {
    return this.data.length
  }

  public constructor(maxSize: number = 0) {
    this.max = maxSize
  }

  /**
   * 尾插入
   * @param data 插入的数据
   */
  public append<D extends T>(data: D) {
    // 人为操作过指针，清除指针后面的元素
    if (this.isRe) {
      this.data.splice(this.point + 1)
      this.isRe = false
    }
    this.data.push(data)
    // 超出链表最大长度
    while (this.max && this.size > this.max) {
      this.data.shift()
    }
    // 从新定位指针到最后一个元素
    this.point = this.size - 1
    return this
  }

  /**
   * 获取当前指针的前一个元素
   */
  public before(): T | undefined {
    const point = this.point - 1
    return this.data[point]
  }

  /**
   * 获取当前指针元素
   */
  public current(): T | undefined {
    return this.data[this.point]
  }

  /**
   * 向前移动指针并获取指针对应的元素
   */
  public prev(): T | undefined {
    this.isRe = true
    this.point--
    if (this.point < 0) {
      this.point = 0
      return undefined
    }
    return this.current()
  }

  /**
   * 向后移动指针并获取指针对应的元素
   */
  public next(): T | undefined {
    this.isRe = true
    this.point++
    if (this.point >= this.size) {
      this.point = this.size - 1
      return undefined
    }
    return this.current()
  }

  /**
   * 丢弃掉指针后的内容
   */
  public clip() {
    return this.data.splice(this.point + 1)
  }

  /**
   * 清除历史数据
   */
  public clear() {
    this.point = 0
    this.isRe = false
    this.data.length = 0
  }
}
