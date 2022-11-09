const express = require("express");
const path = require("node:path");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./app/uploads");
  },
});
const upload = multer({ storage: storage });

const Course = require("../models/Course");

function excludeFields(course, fields) {
  const _course = {};

  for (const [key, value] of Object.entries(course._doc)) {
    fields.forEach((field) => {
      if (key !== field) {
        _course[key] = value;
      }
    });
  }

  return _course;
}

function formatResponseBody(courses) {
  return courses.map((course) => excludeFields(course, ["image"]));
}

router.use("/image", express.static(path.join(__dirname, "../uploads")));

router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    const mappedCourses = formatResponseBody(courses);
    res.json(mappedCourses);
  } catch (error) {
    res.json({ message: error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const course = await Course.findById(id);

    if (!course) {
      return res
        .status(404)
        .json({ message: `Course with id '${id}' does not exist.` });
    }

    const formattedCourse = excludeFields(course, ["image"]);
    res.json(formattedCourse);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(406).json({ message: "Incorrect course id." });
    }
    res.json({ message: error });
  }
});

router.get("/:id/img", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res
        .status(404)
        .json({ message: `Course with id '${req.params.id}' does not exist.` });
    }

    const options = {
      root: path.join(__dirname, "../uploads"),
      headers: {
        "Content-Type": course.image.mimetype,
      },
    };

    res.sendFile(`${course.image.filename}`, options);
  } catch (error) {
    res.json({ message: error });
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const course = new Course({
      title: req.body.title,
      description: req.body.description,
      image: req.file,
    });
    const savedCourse = await course.save();
    const formattedCourse = excludeFields(savedCourse, ["image"]);
    res.json(formattedCourse);
  } catch (error) {
    res.json({ message: error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const course = await Course.findById(id);

    if (!course) {
      return res
        .status(404)
        .json({ message: `Course with id '${id}' does not exist.` });
    }

    const _path = path.join(__dirname, `../uploads/${course.image.filename}`);
    fs.unlink(_path, (err) => {
      if (!err) {
        course.delete();
        return res
          .status(200)
          .json({ message: "Course was successfully deleted." });
      }

      res.status(406).json({ message: err });
    });
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
