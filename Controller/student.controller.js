const { adminvalidator } = require("../Middleware/adminvalidator");
const {
  studentmodel,
  studentlogmodel,
  courseProgress,
} = require("../Model/student.model");
const { coursemodel } = require("../Model/courses.model");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const { Reference } = require("yup");

const studentsignup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Input field validation
    if (!username || !password || !email) {
      return res.status(400).send({
        message: "Input fields cannot be empty",
        status: false,
      });
    }

    // Validate request body with Yup
    try {
      await adminvalidator.validate(req.body);
    } catch (err) {
      return res.status(400).send({
        message: "Invalid input data",
        status: false,
      });
    }

    // Check for existing username or email
    const [existingUsername, existingUser] = await Promise.all([
      studentmodel.findOne({ username }),
      studentmodel.findOne({ email }),
    ]);

    if (existingUsername) {
      return res.status(409).send({
        message: "Username already exists, kindly pick another one",
        status: false,
      });
    }

    if (existingUser) {
      return res.status(409).send({
        message: "Email already registered",
        status: false,
      });
    }

    const student = await studentmodel.create({
      username,
      email,
      password,
    });

    if (!student) {
      return res.status(500).send({
        message: "Unable to save user",
        status: false,
      });
    }

    return res.status(201).send({
      message: "User signed up successfully",
      status: true,
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(409).send({
        message: "Duplicate entry: Email already exists",
      });
    }
    return res.status(500).send({ message: "Internal server error" });
  }
};

const studentlogin = async (req, res) => {
  const { email, password } = req.body;
  // console.log(req.body);
  try {
    if (email === "" || password === "") {
      return res
        .status(405)
        .send({ message: "input fields cannot be empty", status: false });
    }

    const student = await studentmodel.findOne({ email: email });
    if (!student) {
      return res.status(403).send({ message: "user not found", status: false });
    }

    const hashpassword = await bcrypt.compare(password, student.password);
    if (!hashpassword) {
      return res
        .status(401)
        .send({ message: "invalid password", status: false });
    }

    const studentemail = student.email;
    const inalrealdy = await studentlogmodel.findOne({ email: email });

    if (!inalrealdy) {
      const loggedinstudents = await studentlogmodel.create({
        email,
        password,
      });
      console.log("It was a success");
      if (!loggedinstudents) {
        console.log("Saving logged in student failed");
      }
    }
    return res.status(200).send({
      message: "student logged in successful",
      status: true,
      studentemail,
    });
  } catch (error) {
    console.log(error);
    return res.status(408).send({ message: "internal server error" });
  }
};

const studentdash = (req, res) => {
  res.render("index12");
};

const getstudentsignup = (req, res) => {
  res.render("studentsignup");
};

const getstudentlogin = (req, res) => {
  res.render("studentlogin");
};

const getStudents = async (req, res) => {
  const { courseId } = req.params;

  try {
    const students = await studentmodel
      .find({
        courses: { $elemMatch: { courseId: courseId } },
      })
      .select("username email courses");

    res.status(200).json({
      count: students.length,
      students: students,
    });
  } catch (error) {
    console.error("Error fetching students by course ID:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving students",
      error: error.message,
    });
  }
};

const getData = async (req, res) => {
  try {
    const data = await studentmodel.find({});
    if (data.length === 0) {
      console.log("No data found");
      res.status(404).send({ message: "No data found" });
    } else {
      console.log(data);
      data.forEach((student) => {
        console.log(student.username);
      });
      res.status(200).send(data);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal server error" });
  }
};

const getloggin = async (req, res) => {
  try {
    const studentdata = await studentmodel.find({});
    if (studentdata.length === 0) {
      console.log("No data found");
      res.status(404).send({ message: "No data found" });
    } else {
      console.log(studentdata);
      studentdata.forEach((student) => {
        console.log(student.username);
      });
      res.status(200).send(studentdata);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

const updaterId = async (req, res) => {
  try {
    const student = req.params.id;
    const studentIn = await studentmodel.findById(student);
    if (!studentIn) {
      return res.status(404).send("student not found");
    }

    res.send(studentIn);
  } catch (error) {
    return res.status(408).send("student not found shoooo");
  }
};

const paidCourses = async (req, res) => {
  try {
    const { courseTitle, courseId, userId, reference } = req.body;
    console.log(userId);
    console.log(courseTitle, userId, courseId);

    const student = await studentmodel.findByIdAndUpdate(
      userId,
      {
        $push: {
          courses: {
            courseId: courseId,
            courseTitle: courseTitle,
            paid: true,
            Reference: reference,
            certified: false,
          },
        },
      },
      { new: true }
    );
    if (!student) {
      return res.status(404).send("user not found");
    }
    res.json({ message: "Course added successfully" });
  } catch (error) {
    console.error("Error updating user:", error.message, error.stack);
    return res.status(500).send("Error updating user");
  }
};

const getAllPaidCourses = async (req, res) => {
  try {
    const id = req.params.id;

    const student = await studentmodel.findById(id);
    if (!student) {
      return res.status(404).send("User not found");
    }

    const courseIds = student.courses.map((course) => course.courseId);
    const courses = await coursemodel.find({ _id: { $in: courseIds } });
    res.status(200).send(courses);
  } catch (error) {
    console.error("Error fetching courses:", error.message);
    res.status(500).send("Error fetching courses");
  }
};

const videoProgress = async (req, res) => {
  const { userId, courseId, videoId } = req.body;

  if (!userId || !courseId || !videoId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    let progressEntry = await courseProgress.findOne({
      studentId: userId,
      courseId: courseId,
    });

    if (!progressEntry) {
      progressEntry = new courseProgress({
        studentId: userId,
        courseId: courseId,
        progress: [{ videoId, watched: true }],
      });
      await progressEntry.save();
      return res
        .status(201)
        .json({ message: "Progress created successfully", watched: true });
    }

    const existingVideoProgress = progressEntry.progress.find(
      (p) => p.videoId.toString() === videoId
    );

    if (existingVideoProgress) {
      existingVideoProgress.watched = true;
      existingVideoProgress.watchedAt = Date.now();
    } else {
      progressEntry.progress.push({ videoId, watched: true });
    }

    await progressEntry.save();
    console.log("Progress updated successfully");

    res.status(200).json({ message: "Progress updated successfully" });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ message: "Error updating progress" });
  }
};

const getallstudents = async (req, res) => {
  try {
    const allstudents = await studentmodel.find({});

    if (allstudents.length === 0) {
      console.log("No data found");
      res.status(404).send({ message: "No data found" });
    } else {
      allstudents.forEach((students) => {
        // console.log(students.username);
      });
      res.status(200).send(allstudents);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error getting all students" });
  }
};

const isVideoWatched = async (req, res) => {
  const { userId, courseId, videoId } = req.body;
  if (!userId || !courseId || !videoId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const progressEntry = await courseProgress.findOne({
      studentId: userId,
      courseId: courseId,
    });

    if (!progressEntry) {
      return res.status(200).json({ watched: false });
    }
    const videoProgress = progressEntry.progress.find(
      (p) => p.videoId.toString() === videoId
    );

    if (videoProgress) {
      return res.status(200).json({ watched: videoProgress.watched });
    } else {
      return res.status(200).json({ watched: false });
    }
  } catch (error) {
    console.error("Error checking video status:", error);
    return res.status(500).json({ message: "Error checking video status" });
  }
};

const checkCertificationEligibility = async (req, res) => {
  const { userId, courseId } = req.body;
  try {
    const course = await coursemodel.findById(courseId);
    if (!course) {
      return res.status(200).json({
        failed: true,
        message: "Kindly make your purchase to start course with us",
      });
    }

    const progressEntry = await courseProgress.findOne({
      studentId: userId,
      courseId: courseId,
    });

    if (!progressEntry) {
      return res.status(200).json({
        failed: true,
        message: "No progress found. You are almost there.",
      });
    }

    const allVideos = course.videos;
    const watchedVideos = progressEntry.progress;

    const allWatched = allVideos.every((video) => {
      const videoProgress = watchedVideos.find(
        (v) => v.videoId.toString() === video._id.toString()
      );
      return videoProgress && videoProgress.watched;
    });

    const currentStudent = await studentmodel.findById(userId).lean();
    const courseData = currentStudent.courses.find(
      (course) => course.courseId === courseId
    );

    if (allWatched) {
      await studentmodel.updateOne(
        { _id: userId, "courses.courseId": courseId },
        { $set: { "courses.$.certified": true } }
      );

      return res.status(200).json({
        success: true,
        certified: true,
        status: courseData.status, // Return the status of the course
        message: "Student is eligible for certification.",
      });
    } else {
      return res.status(200).json({
        failed: true,
        certified: courseData.certified,
        status: courseData.status, // Return the status of the course
        message: "Not all videos have been watched.",
      });
    }
  } catch (error) {
    console.error("Error checking certification eligibility:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while checking eligibility.",
    });
  }
};

const getStudentProgressData = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await studentmodel.findById(id).lean();
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const purchasedCourses = student.courses || []; // Ensure `courses` is an array

    // Fetch course progress data
    const courseProgressData = await courseProgress
      .find({ studentId: id })
      .populate({
        path: "courseId", // Populating course details
        model: studentmodel,
        select: "courseName price videos", // Include necessary fields
      })
      .lean();

    const paidCourses = [];
    let totalWatchedVideos = 0;
    const coursesWithNoProgress = [];

    const progressCourseIds = new Set(
      courseProgressData
        .filter((progress) => progress.courseId)
        .map((progress) => progress.courseId._id.toString())
    );

    for (const progress of courseProgressData) {
      const course = progress.courseId; // Get the course data from the populated field

      // Check if the course exists before accessing its properties
      if (!course) {
        continue; // Skip if no course found
      }

      const watchedVideosCount = progress.progress.filter(
        (video) => video.watched
      ).length;
      totalWatchedVideos += watchedVideosCount;

      const courseDetails = await coursemodel.findById(course._id).lean();

      if (!courseDetails) {
        continue; // Skip if course details not found
      }

      const allVideos = courseDetails.videos || []; // Ensure `videos` is an array
      const allWatched = allVideos.every((video) => {
        const videoProgress = progress.progress.find(
          (v) => v.videoId.toString() === video._id.toString()
        );
        return videoProgress && videoProgress.watched;
      });

      // Add paid course to the response
      paidCourses.push({
        courseId: course._id,
        courseName: course.courseName || "Unknown", // Fallback for courseName
        price: course.price || 0, // Fallback for price
        watchedVideosCount: watchedVideosCount,
        certified: allWatched, // Add certification status
      });
    }

    // Check for purchased courses with no progress
    for (const course of purchasedCourses) {
      if (!progressCourseIds.has(course.courseId.toString())) {
        coursesWithNoProgress.push(course); // Store course IDs with no progress
      }
    }

    // If no paid courses or progress, send a message indicating no courses purchased
    if (paidCourses.length === 0 && coursesWithNoProgress.length === 0) {
      return res.status(200).json({
        message:
          "The student hasn't paid for any courses or hasn't made any progress.",
        studentDetails: {
          id: student._id,
          username: student.username,
          email: student.email,
          totalWatchedVideos: totalWatchedVideos,
        },
      });
    }

    // Create the final result object
    const result = {
      studentDetails: {
        id: student._id,
        username: student.username,
        email: student.email,
        totalWatchedVideos: totalWatchedVideos,
      },
      paidCourses: paidCourses,
      coursesWithNoProgress: coursesWithNoProgress, // Add purchased courses with no progress
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error fetching student data" });
  }
};

const approveCertification = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Fetch the student's course details
    const student = await studentmodel.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Find the specific course in the student's courses
    const course = student.courses.find((c) => c.courseId === courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    if (!course.paid) {
      return res.status(400).json({
        message: "Certification cannot be approved for unpaid courses.",
      });
    }

    const progress = await courseProgress
      .findOne({
        studentId,
        courseId,
      })
      .lean();

    const allVideosWatched = progress
      ? progress.progress.every((video) => video.watched)
      : false;

    if (!allVideosWatched) {
      return res.status(400).json({
        message:
          "Certification cannot be approved. Not all videos are watched.",
      });
    }

    course.status = "Approved";
    await student.save();

    res.status(200).json({
      message: "Certification approved successfully.",
      courseId,
      status: course.status,
    });
  } catch (error) {
    console.error("Error approving certification:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

const declineCertification = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Fetch the student's course details
    const student = await studentmodel.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Find the specific course in the student's courses
    const course = student.courses.find((c) => c.courseId === courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    if (!course.paid) {
      return res.status(400).json({
        message: "Certification cannot be approved for unpaid courses.",
      });
    }

    const progress = await courseProgress
      .findOne({
        studentId,
        courseId,
      })
      .lean();

    const allVideosWatched = progress
      ? progress.progress.every((video) => video.watched)
      : false;

    if (!allVideosWatched) {
      return res.status(400).json({
        message:
          "Certification cannot be Declined. Not all videos are watched.",
      });
    }

    course.status = "Declined";
    await student.save();

    res.status(200).json({
      message: "Certification Declined successfully.",
      courseId,
      status: course.status,
    });
  } catch (error) {
    console.error("Error declinging certification:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const Student = await studentmodel.findById(id);

    if (!Student) {
      return res
        .status(404)
        .json({ message: "Student not found", status: false });
    }

    await studentmodel.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ message: "Student deleted successfully", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  studentsignup,
  getStudents,
  videoProgress,
  checkCertificationEligibility,
  isVideoWatched,
  getAllPaidCourses,
  updaterId,
  paidCourses,
  getloggin,
  studentlogin,
  getallstudents,
  getData,
  getstudentlogin,
  getstudentsignup,
  studentdash,
  getStudentProgressData,
  deleteStudent,
  approveCertification,
  declineCertification,
};
