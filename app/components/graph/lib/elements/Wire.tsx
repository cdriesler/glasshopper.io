import React from 'react'
import { Glasshopper } from 'glib'
import { useGraphManager } from '@/context/graph'
import { position } from '@/utils'

type WireProps = {
  instanceId: string
}

export const Wire = ({ instanceId: id }: WireProps): React.ReactElement | null => {
  const {
    store: { elements, activeKeys },
  } = useGraphManager()

  if (!elements[id]) {
    console.error(`Element '${id}' does not exist.'`)
    return null
  }

  const element = elements[id] as Glasshopper.Element.Wire

  if (!isWire(element)) {
    console.error(`Element ${id} is not a 'wire' element.`)
    return null
  }

  const { current } = element

  if (current.mode === 'hidden') {
    return null
  }

  const [ax, ay] = current.from
  const [bx, by] = current.to

  const [from, to] = position.getExtents(current.from, current.to)

  const min = { x: from[0], y: from[1] }
  const max = { x: to[0], y: to[1] }

  const width = Math.abs(ax - bx)
  const height = Math.abs(ay - by)

  const start = {
    x: ax < bx ? 0 : width,
    y: ay < by ? height : 0,
  }
  const end = {
    x: start.x === 0 ? width : 0,
    y: start.y === 0 ? height : 0,
  }
  const mid = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  }

  const goingRight = start.x < end.x
  const goingDown = start.y < end.y

  const wc = width * (goingRight ? 0.15 : -0.35)
  const hc = height * (goingDown ? 0.35 : -0.35)

  const { from: fromSource, to: toSource } = element.current.sources

  const getWireGraphics = (d: string): React.ReactNode => {
    const fromElement = elements[fromSource.element]

    const thin = <path d={d} strokeWidth="3px" stroke="#333333" fill="none" vectorEffect="non-scaling-stroke" />

    const thick = (
      <>
        <path d={d} strokeWidth="6px" stroke="#333333" fill="none" vectorEffect="non-scaling-stroke" />
        <path d={d} strokeWidth="2px" stroke="#FCFCFC" fill="none" vectorEffect="non-scaling-stroke" />
      </>
    )

    const dashed = (
      <>
        <path
          d={d}
          strokeWidth="6px"
          stroke="#333333"
          fill="none"
          strokeDasharray="6 9"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={d}
          strokeWidth="2px"
          stroke="#FCFCFC"
          fill="none"
          strokeDasharray="6 9"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </>
    )

    if (id == 'live-wire' || !fromElement) {
      return thin
    }

    let tree: Glasshopper.Data.DataTree = {}

    switch (fromElement.template.type) {
      case 'static-component':
        tree = (fromElement as Glasshopper.Element.StaticComponent).current.values[fromSource.parameter] ?? {}
        break
      case 'static-parameter':
        tree = (fromElement as Glasshopper.Element.StaticParameter).current.values ?? {}
    }

    const branches = Object.keys(tree)

    if (branches.length > 1) {
      return dashed
    }

    const values = Object.values(tree)?.[0] ?? []

    return values.length > 1 ? thick : thin
  }

  const d = [
    `M ${start.x} ${start.y} `,
    // `L ${start.x + o} ${start.y} `,
    `C ${start.x + wc} ${start.y} ${mid.x - wc / 1.5} ${mid.y - hc} ${mid.x} ${mid.y} `,
    `S ${end.x - wc} ${end.y} ${end.x} ${end.y} `,
    // `L ${end.x} ${end.y}`
  ].join('')

  const getTooltipGraphics = (): React.ReactNode => {
    if (activeKeys.length !== 1) {
      return null
    }

    const [key] = activeKeys

    switch (key) {
      case 'ControlLeft': {
        return (
          <div className="w-8 h-12 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 -1 10 12">
              <circle
                cx="5"
                cy="6"
                r="4.5"
                fill="#333333"
                stroke="#333333"
                strokeWidth="2px"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx="5"
                cy="5"
                r="4.5"
                fill="#FFFFFF"
                stroke="#333333"
                strokeWidth="2px"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="3"
                y1="5"
                x2="7"
                y2="5"
                stroke="#333333"
                strokeWidth="3px"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )
      }
      case 'ShiftLeft': {
        return (
          <div className="w-8 h-12 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 -1 10 12">
              <circle
                cx="5"
                cy="6"
                r="4.5"
                fill="#333333"
                stroke="#333333"
                strokeWidth="2px"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx="5"
                cy="5"
                r="4.5"
                fill="#FFFFFF"
                stroke="#333333"
                strokeWidth="2px"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="3"
                y1="5"
                x2="7"
                y2="5"
                stroke="#333333"
                strokeWidth="3px"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
              />
              <line
                x1="5"
                y1="3"
                x2="5"
                y2="7"
                stroke="#333333"
                strokeWidth="3px"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )
      }
      default: {
        return null
      }
    }
  }

  return (
    <div
      className="absolute z-10 overflow-visible pointer-events-none"
      style={{ left: min.x, top: -max.y, width, height }}
    >
      <div className="relative w-full h-full">
        <svg
          className="absolute left-0 top-0 overflow-visible z-10"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          {getWireGraphics(d)}
        </svg>
        {id === 'live-wire' ? (
          <div className={`${goingRight ? 'right-0' : 'left-0'} absolute`} style={{ top: goingDown ? height : 0 }}>
            {getTooltipGraphics()}
          </div>
        ) : null}
      </div>
    </div>
  )
}

const isWire = (element: Glasshopper.Element.Base): element is Glasshopper.Element.Wire => {
  return element.template.type === 'wire'
}
