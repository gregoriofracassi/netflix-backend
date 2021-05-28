import express from "express"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { getMedia, writeMedia } from "../lib/fs-tools.js"

const filesRouter = express.Router()

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Strive",
  },
})

const upload = multer({ storage: cloudinaryStorage }).single("poster")

filesRouter.post("/uploadPoster/:id", upload, async (req, res, next) => {
  try {
    const media = await getMedia()
    const movie = media.find((m) => m._id === req.params.id)
    movie.poster = req.file.path
    const remainMedia = media.filter((m) => m._id !== req.params.id)
    remainMedia.push(movie)
    await writeMedia(remainMedia)
    res.send(movie.poster)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

export default filesRouter
