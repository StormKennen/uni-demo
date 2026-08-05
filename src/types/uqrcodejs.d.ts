declare module 'uqrcodejs' {
  type QrCanvasContext = CanvasRenderingContext2D | ReturnType<typeof uni.createCanvasContext>

  export default class UQRCode {
    static errorCorrectLevel: {
      M: number
    }

    areaColor: string
    backgroundColor: string
    canvasContext: QrCanvasContext
    data: string
    dynamicSize: number
    errorCorrectLevel: number
    foregroundColor: string
    margin: number
    moduleCount: number
    modules: boolean[][]
    size: number
    useDynamicSize: boolean

    drawCanvas(): void | Promise<void>
    make(): void
  }
}
