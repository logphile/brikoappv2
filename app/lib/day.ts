import dayjs from 'dayjs/esm'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// Extend and export a single, shared instance
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

export default dayjs
