const ClientFeedback = require("../models/clientFeedback");
const Clients = require("../models/clients");

// Create client feedback
exports.createFeedback = async (req, res) => {
  try {
    const {
      clientId,
      feedbackType,
      rating,
      comments,
      categories
    } = req.body;

    // Validate required fields
    if (!clientId) {
      return res.status(400).json({ error: "Client ID is required" });
    }

    if (!feedbackType || !rating) {
      return res.status(400).json({ error: "Feedback type and rating are required" });
    }

    // Verify client exists
    const client = await Clients.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const feedback = new ClientFeedback({
      clientId: clientId,
      clientName: client.name,
      feedbackType,
      rating,
      comments: comments || "",
      categories: categories || [],
      createdBy: req.user.id || null
    });

    await feedback.save();

    res.status(201).json({
      message: "Feedback created successfully",
      feedback
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get feedback by client
exports.getFeedbackByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { feedbackType, status, limit = 10, page = 1 } = req.query;

    const query = { clientId };

    if (feedbackType) {
      query.feedbackType = feedbackType;
    }

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedback = await ClientFeedback.find(query)
      .populate("createdBy", "name email")
      .sort({ feedbackDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await ClientFeedback.countDocuments(query);

    if (!feedback || feedback.length === 0) {
      return res.status(404).json({ message: "No feedback found for this client" });
    }

    res.status(200).json({
      feedback,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: skip + feedback.length < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all feedback with filtering
// exports.getAllFeedback = async (req, res) => {
//   try {
//     const {
//       clientId,
//       feedbackType,
//       status,
//       startDate,
//       endDate,
//       month,
//       minRating,
//       maxRating,
//       limit = 20,
//       page = 1
//     } = req.query;

//     const query = {};

//     if (clientId) query.clientId = clientId;
//     if (feedbackType) query.feedbackType = feedbackType;
//     if (status) query.status = status;
//     if (month) query.month = month;

//     if (startDate || endDate) {
//       query.feedbackDate = {};
//       if (startDate) query.feedbackDate.$gte = new Date(startDate);
//       if (endDate) query.feedbackDate.$lte = new Date(endDate);
//     }

//     if (minRating || maxRating) {
//       query.rating = {};
//       if (minRating) query.rating.$gte = parseInt(minRating);
//       if (maxRating) query.rating.$lte = parseInt(maxRating);
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const feedback = await ClientFeedback.find(query)
//       .populate("clientId", "name")
//       .populate("createdBy", "name email")
//       .sort({ feedbackDate: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const totalCount = await ClientFeedback.countDocuments(query);

//     // Calculate summary statistics
//     const allFeedback = await ClientFeedback.find(query);
//     const summary = {
//       totalFeedback: allFeedback.length,
//       averageRating: allFeedback.length > 0 
//         ? (allFeedback.reduce((sum, fb) => sum + fb.rating, 0) / allFeedback.length).toFixed(2)
//         : 0,
//       feedbackByType: {
//         Good: allFeedback.filter(fb => fb.feedbackType === 'Good').length,
//         Bad: allFeedback.filter(fb => fb.feedbackType === 'Bad').length,
//         Neutral: allFeedback.filter(fb => fb.feedbackType === 'Neutral').length
//       },
//     };

//     res.status(200).json({
//       feedback,
//       summary,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(totalCount / parseInt(limit)),
//         totalCount,
//         hasNext: skip + feedback.length < totalCount,
//         hasPrev: parseInt(page) > 1
//       }
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Update feedback
// exports.updateFeedback = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     // Remove fields that shouldn't be updated
//     delete updateData._id;
//     delete updateData.createdAt;


//     const feedback = await ClientFeedback.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     if (!feedback) {
//       return res.status(404).json({ message: "Feedback not found" });
//     }

//     res.status(200).json({
//       message: "Feedback updated successfully",
//       feedback
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Delete feedback
// exports.deleteFeedback = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const feedback = await ClientFeedback.findByIdAndDelete(id);

//     if (!feedback) {
//       return res.status(404).json({ message: "Feedback not found" });
//     }

//     res.status(200).json({ message: "Feedback deleted successfully" });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
