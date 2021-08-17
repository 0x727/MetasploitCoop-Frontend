import { fileSizeFormat, timestampFormat } from '@/utils/util'
import { timesFormat } from '@/utils/filters/date_format'

export default {
  filters: {
    filemodFilter(filemod) {
      if (!filemod) {
        return ''
      }
      return filemod.split('/')[1]
    },
    transitFileSizeFilter(filesize) {
      if (isNaN(filesize)) {
        return filesize
      }
      return fileSizeFormat(filesize)
    },
    timesFilter(times) {
      return timesFormat(times).slice(0, -3)
    },
    timestampFilter(timestamp) {
      return timestampFormat(timestamp)
    }
  }
}
