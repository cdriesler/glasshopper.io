import { SourceType } from './SourceType'
import { ValueType } from './ValueType'
import * as GH from './values'

export type DataTree = {
  [path: string]: DataTreeValue<ValueType>[]
}

export type DataTreeValue<T extends ValueType> = {
  from: SourceType
  type: T
  data: T extends 'string'
    ? GH.String
    : T extends 'number'
    ? GH.Number
    : T extends 'point'
    ? GH.Point
    : never
}