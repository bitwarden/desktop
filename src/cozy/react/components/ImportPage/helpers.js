/**
 * Taken from https://github.com/bitwarden/web/blob/e968d5a2a5b1b6921a8df3ec9da38b71c4c92b8f/src/app/tools/import.component.ts#L125-L148
 * Read a File content and returns it as a string. It handles specific cases like
 * Lastpass CSV files that needs specific parsing with a DOMParser
 *
 * @param {File} file - the file to read
 * @param {string} format - the expected format of the file (see ImportService
 * from bitwarden jslib to get all possible formats)
 * @return {string} the content of the file
 */
export const getFileContent = (file, format) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsText(file, 'utf-8')

    reader.onload = e => {
      if (format === 'lastpasscsv' && file.type === 'text/html') {
        const parser = new DOMParser()
        const doc = parser.parseFromString(e.target.result, 'text/html')
        const pre = doc.querySelector('pre')

        if (pre != null) {
          resolve(pre.textContent)
          return
        }

        reject()
        return
      }

      resolve(e.target.result)
    }

    reader.onerror = () => {
      reject()
    }
  })
}
