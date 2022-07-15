import { unlink } from "fs"

export const deleteFile = (filePath) => {
  unlink(filePath, (err) => {
    if (err) {
      throw err
    }
  })
}