import express from "express"
import uniqid from "uniqid"
import { bodyValidator } from "./validation.js"
import { validationResult } from "express-validator"
import createError from "http-errors"
import { getMedia, writeMedia } from "../lib/fs-tools.js"
import fetch from "node-fetch"

const mediaRouter = express.Router()

mediaRouter.get("/", async (req, res, next) => {
  try {
    const media = await getMedia()
    if (req.query.title) {
      const filteredMedia = media.filter(
        (media) =>
          media.hasOwnProperty("title") &&
          media.title.toLowerCase().includes(req.query.title.toLowerCase())
      )
      if (filteredMedia.length === 0) {
        try {
          let response = await fetch(
            `http://www.omdbapi.com/?i=tt3896198&apikey=c65cdbe8&s=${req.query.title}`
          )
          if (response.ok) {
            let data = await response.json()
            media.push(...data.Search)
            await writeMedia(media)
            res.send(data)
          }
        } catch (error) {
          console.log(error)
        }
      } else {
        res.send(filteredMedia)
      }
    } else {
      res.send(media)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

mediaRouter.get("/:id", async (req, res, next) => {
  try {
    const media = await getMedia()
    const movie = media.find((m) => m._id === req.params.id)
    if (movie) {
      res.send(movie)
    } else {
      next(createError(404, "Movie with this id doesnt exist!"))
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

mediaRouter.post("/", bodyValidator, async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      next(createError(400, { errorList: errors }))
    } else {
      const media = await getMedia()
      const newMedia = {
        ...req.body,
        _id: uniqid(),
        createdAt: new Date(),
        reviews: [],
      }
      media.push(newMedia)
      await writeMedia(media)

      res.status(201).send({ id: newMedia._id })
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

mediaRouter.put("/:id", bodyValidator, async (req, res, next) => {
  try {
    const media = await getMedia()
    const remainMedia = media.filter((m) => m._id !== req.params.id)
    const movie = media.find((m) => m._id === req.params.id)
    const modMedia = {
      ...req.body,
      _id: req.params.id,
      modifiedAt: new Date(),
      reviews: movie.reviews,
      poster: movie.poster,
    }
    remainMedia.push(modMedia)
    await writeMedia(remainMedia)
    res.send(modMedia)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

mediaRouter.delete("/:id", async (req, res, next) => {
  try {
    const media = await getMedia()
    const remainMedia = media.filter((m) => m._id !== req.params.id)

    await writeMedia(remainMedia)
    res.status(204).send(`succesfully deleted elemend with id:${req.params.id}`)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

mediaRouter.post("/:id/review", async (req, res, next) => {
  try {
    const media = await getMedia()
    const movie = media.find((m) => m._id === req.params.id)
    const newReview = {
      ...req.body,
      createdAt: new Date(),
      _id: uniqid(),
      media_id: req.params.id,
    }
    movie.reviews.push(newReview)
    const remainMedia = media.filter((m) => m._id !== req.params.id)
    remainMedia.push(movie)
    await writeMedia(remainMedia)
    res.send(movie)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

mediaRouter.delete("/:media_id/review/:review_id", async (req, res, next) => {
  try {
    const media = await getMedia()
    const movie = media.find((m) => m._id === req.params.media_id)
    const remainReviews = movie.reviews.filter(
      (r) => r._id !== req.params.review_id
    )
    movie.reviews = remainReviews
    const remainMedia = media.filter((m) => m._id !== req.params.media_id)
    remainMedia.push(movie)
    await writeMedia(remainMedia)
    res.send(media)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

export default mediaRouter
