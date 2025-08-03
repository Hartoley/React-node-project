const { adminvalidator } = require("../Middleware/adminvalidator");
const bcrypt = require("bcryptjs");
const upload = require("../utils/mutler");
const { coursemodel } = require("../Model/courses.model");
const cour = require("../Model/courses.model");
const { cloudinary } = require("../utils/clodinary");
const fs = require("fs");

const getcourses = (req, res) => {
  res.render("coursestemp");
};

const toStringArray = (value) => {
  if (Array.isArray(value)) return value.map((i) => i.toString().trim());
  if (typeof value === "object" && value !== null)
    return Object.values(value).map((i) => i.toString().trim());
  if (typeof value === "string") return value.split(",").map((i) => i.trim());
  return [];
};

const updateCourse = async (req, res) => {
  try {
    const {
      title,
      sub_title,
      language,
      sub_language,
      category,
      sub_category,
      createdBy,
      learn,
      requirements,
      description,
      authors_name,
      price,
    } = req.body;

    const uploadedVideo = req.file;

    const courseExist = await coursemodel.findOne({ title });
    if (courseExist) {
      return res
        .status(400)
        .send({ message: "Course already exists", status: false });
    }

    const validVideoExtensions = ["mp4", "avi", "mov", "wmv", "flv", "mkv"];
    const fileExtension = uploadedVideo.originalname
      .split(".")
      .pop()
      .toLowerCase();

    if (!validVideoExtensions.includes(fileExtension)) {
      fs.unlinkSync(uploadedVideo.path);
      return res.status(400).json({ message: "Invalid video file type" });
    }

    const uploadResult = await cloudinary.uploader.upload(uploadedVideo.path, {
      resource_type: "video",
    });

    const videoUrl = uploadResult.secure_url;

    const newCourse = await coursemodel.create({
      title,
      sub_title,
      language: toStringArray(language),
      sub_language: toStringArray(sub_language),
      category: toStringArray(category),
      sub_category: toStringArray(sub_category),
      createdBy,
      learn: toStringArray(learn),
      requirements: toStringArray(requirements),
      description,
      authors_name,
      price,
      previewVideo: videoUrl,
    });

    res.status(200).send({
      message: "Course created",
      status: true,
      course: newCourse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};

const editCourse = async (req, res) => {
  try {
    const {
      title,
      sub_title,
      language,
      sub_language,
      category,
      sub_category,
      createdBy,
      learn,
      requirements,
      description,
      authors_name,
      price,
    } = req.body;

    const uploadedVideo = req.file;
    const courseId = req.params.courseId;

    const existingCourse = await coursemodel.findById(courseId);
    if (!existingCourse) {
      return res
        .status(404)
        .send({ message: "Course not found", status: false });
    }

    let videoUrl = existingCourse.previewVideo;
    if (uploadedVideo) {
      const validVideoExtensions = ["mp4", "avi", "mov", "wmv", "flv", "mkv"];
      const fileExtension = uploadedVideo.originalname
        .split(".")
        .pop()
        .toLowerCase();

      if (!validVideoExtensions.includes(fileExtension)) {
        fs.unlinkSync(uploadedVideo.path);
        return res.status(400).json({ message: "Invalid video file type" });
      }

      const uploadResult = await cloudinary.uploader.upload(
        uploadedVideo.path,
        {
          resource_type: "video",
        }
      );
      videoUrl = uploadResult.secure_url;
    }

    existingCourse.title = title;
    existingCourse.sub_title = sub_title;
    existingCourse.language = toStringArray(language);
    existingCourse.sub_language = toStringArray(sub_language);
    existingCourse.category = toStringArray(category);
    existingCourse.sub_category = toStringArray(sub_category);
    existingCourse.createdBy = createdBy;
    existingCourse.learn = toStringArray(learn);
    existingCourse.requirements = toStringArray(requirements);
    existingCourse.description = description;
    existingCourse.authors_name = authors_name;
    existingCourse.price = price;
    existingCourse.previewVideo = videoUrl;

    const updatedCourse = await existingCourse.save();

    res.status(200).send({
      message: "Course updated successfully",
      status: true,
      course: updatedCourse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await coursemodel.findById(courseId);

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found", status: false });
    }

    await coursemodel.findByIdAndDelete(courseId);

    return res
      .status(200)
      .json({ message: "Course deleted successfully", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const uploadVideos = async (req, res) => {
  const { sub_title } = req.body;
  const courseMain = req.params.courseId;
  const uploadedVideo = req.file;

  console.log("uploadedVideo:", uploadedVideo);
  console.log("Uploaded file path:", uploadedVideo.path);

  try {
    if (!uploadedVideo) {
      return res
        .status(406)
        .json({ message: "Please select a video to upload" });
    }

    const course = await coursemodel.findById(courseMain);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const validVideoExtensions = ["mp4", "avi", "mov", "wmv", "flv", "mkv"];
    if (validVideoExtensions) {
      console.log(uploadedVideo);
      console.log("Video format is valid");
    }
    const fileExtension = uploadedVideo.originalname
      .split(".")
      .pop()
      .toLowerCase();

    if (!validVideoExtensions.includes(fileExtension)) {
      fs.unlinkSync(uploadedVideo.path);
      return res.status(400).json({ message: "Invalid video file type" });
    }

    const uploadResult = await cloudinary.uploader.upload(uploadedVideo.path, {
      resource_type: "video",
    });

    const videoUrl = uploadResult.secure_url;

    const updatedCourse = await coursemodel.findByIdAndUpdate(
      course._id,
      { $push: { videos: { sub_title, url: videoUrl } } },
      { new: true }
    );

    if (!updatedCourse) {
      console.error("Error updating course schema");
      return res.status(500).json({ message: "Internal server error" });
    }

    fs.unlink(uploadedVideo.path, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log("File deleted successfully");
      }
    });

    //  fs.unlink(uploadedVideo.path);

    res.status(200).json({
      message: "Video uploaded and course updated successfully",
      videoUrl,
    });
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      res.status(409).json({ message: "Invalid course ID" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

const getAllVideos = async (req, res) => {
  try {
    const allvideos = await coursemodel.find({});

    if (allvideos.length < 0) {
      console.log("No data found");
      res.status(404).send({ message: "No data found" });
    } else {
      // allvideos.forEach((videos) => {
      //   console.log(videos.username);
      // });
      res.status(200).send(allvideos);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error getting all videos" });
  }
};

const getCourseData = async (req, res) => {
  try {
    const course = req.params.courseId;
    const adminIn = await coursemodel.findById(course);
    res.send(adminIn);
  } catch (error) {
    return res.status(408).send("course not found shoooo");
  }
};

const updateCourseData = async (req, res) => {
  const courses = req.params.courseId;
  const { search, value } = req.body;
  console.log(search);
  console.log(value);
  try {
    const existingCourse = await coursemodel.findById(courses);

    if (!existingCourse) {
      return res.status(409).send({ message: "Course not found" });
    }

    if (search === "" || value === "") {
      return res
        .status(402)
        .send({ message: "Input fields cannot be empty", status: false });
    }

    const validField = Object.keys(existingCourse.schema.paths).includes(
      search
    );

    if (!validField) {
      return res
        .status(400)
        .send({ message: "Invalid update field: " + search });
    }

    const updateData = { $push: { [search]: value } };
    if (updateData) {
      console.log("ok");
    }

    const updatedCourse = await coursemodel.findOneAndUpdate(
      { _id: courses },
      updateData,
      { new: true }
    );

    if (updatedCourse) {
      res.status(200).send({
        message: "Course updated successfully",
        courses: updatedCourse,
      });
    } else {
      res.status(400).send({ message: "Error updating course" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "Error updating course", error: error.message });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { courseId, videoId } = req.params;

    const updatedCourse = await coursemodel.findByIdAndUpdate(
      courseId,
      { $pull: { videos: { _id: videoId } } },
      { new: true }
    );

    if (!updatedCourse) {
      return res
        .status(404)
        .json({ message: "Course not found", status: false });
    }

    res.status(200).json({
      message: "Video deleted successfully",
      status: true,
      course: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getcourses,
  updateCourse,
  uploadVideos,
  getAllVideos,
  getCourseData,
  updateCourseData,
  deleteCourse,
  editCourse,
  deleteVideo,
};
