import {format as formatFns} from 'date-fns'

export const format = (date: Date) => formatFns(date, 'yyyy-MM-dd HH:mm')