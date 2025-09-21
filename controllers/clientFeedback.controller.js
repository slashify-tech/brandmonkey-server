// const ClientFeedback = require("../models/clientFeedback");
// const Clients = require("../models/clients");

// // Create client feedback
// exports.createFeedback = async (req, res) => {
//   try {
//     const {
//       clientId,
//       feedbackType,
//       rating,
//       comments,
//       categories,
//       requiresFollowUp,
//       followUpDate,
//       followUpNotes,
//       createdBy
//     } = req.body;

//     // Validate required fields
//     if (!clientId) {
//       return res.status(400).json({ error: "Client ID is required" });
//     }

//     if (!feedbackType || !rating) {
//       return res.status(400).json({ error: "Feedback type and rating are required" });
//     }

//     // Verify client exists
//     const client = await Clients.findById(clientId);
//     if (!client) {
//       return res.status(404).json({ error: "Client not found" });
//     }

//     // Ensure proper date formatting
//     const formattedFollowUpDate = followUpDate ? new Date(followUpDate) : null;

//     const feedback = new ClientFeedback({
//       clientId: clientId,
//       clientName: client.name,
//       feedbackType,
//       rating,
//       comments: comments || "",
//       categories: categories || [],
//       requiresFollowUp: requiresFollowUp || false,
//       followUpDate: formattedFollowUpDate,
//       followUpNotes: followUpNotes || "",
//       createdBy: createdBy || null
//     });

//     await feedback.save();

//     res.status(201).json({
//       message: "Feedback created successfully",
//       feedback
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Get feedback by client
// exports.getFeedbackByClient = async (req, res) => {
//   try {
//     const { clientId } = req.params;
//     const { feedbackType, status, limit = 10, page = 1 } = req.query;

//     const query = { clientId };

//     if (feedbackType) {
//       query.feedbackType = feedbackType;
//     }

//     if (status) {
//       query.status = status;
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const feedback = await ClientFeedback.find(query)
//       .populate("createdBy", "name email")
//       .sort({ feedbackDate: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const totalCount = await ClientFeedback.countDocuments(query);

//     if (!feedback || feedback.length === 0) {
//       return res.status(404).json({ message: "No feedback found for this client" });
//     }

//     res.status(200).json({
//       feedback,
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

// // Get all feedback with filtering
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
//       requiresFollowUp,
//       limit = 20,
//       page = 1
//     } = req.query;

//     const query = {};

//     if (clientId) query.clientId = clientId;
//     if (feedbackType) query.feedbackType = feedbackType;
//     if (status) query.status = status;
//     if (month) query.month = month;
//     if (requiresFollowUp !== undefined) query.requiresFollowUp = requiresFollowUp === 'true';

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
//       requiresFollowUp: allFeedback.filter(fb => fb.requiresFollowUp).length
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

//     // Ensure proper date formatting for followUpDate
//     if (updateData.followUpDate) {
//       updateData.followUpDate = new Date(updateData.followUpDate);
//     }

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

// // Get client health analytics
// exports.getClientHealthAnalytics = async (req, res) => {
//   try {
//     const { clientId, startDate, endDate, month } = req.query;

//     const query = {};
//     if (clientId) query.clientId = clientId;
//     if (month) query.month = month;
//     if (startDate || endDate) {
//       query.feedbackDate = {};
//       if (startDate) query.feedbackDate.$gte = new Date(startDate);
//       if (endDate) query.feedbackDate.$lte = new Date(endDate);
//     }

//     const feedback = await ClientFeedback.find(query)
//       .populate("clientId", "name")
//       .sort({ feedbackDate: -1 });

//     // Group by client
//     const clientAnalytics = {};

//     feedback.forEach(fb => {
//       const clientName = fb.clientId?.name || fb.clientName;
      
//       if (!clientAnalytics[clientName]) {
//         clientAnalytics[clientName] = {
//           clientId: fb.clientId,
//           clientName: clientName,
//           totalFeedback: 0,
//           averageRating: 0,
//           feedbackHistory: [],
//           healthScore: 0,
//           lastFeedbackDate: null,
//           requiresFollowUp: false
//         };
//       }

//       clientAnalytics[clientName].totalFeedback++;
//       clientAnalytics[clientName].feedbackHistory.push({
//         date: fb.feedbackDate,
//         type: fb.feedbackType,
//         rating: fb.rating,
//         comments: fb.comments
//       });

//       if (!clientAnalytics[clientName].lastFeedbackDate || 
//           fb.feedbackDate > clientAnalytics[clientName].lastFeedbackDate) {
//         clientAnalytics[clientName].lastFeedbackDate = fb.feedbackDate;
//       }

//       if (fb.requiresFollowUp) {
//         clientAnalytics[clientName].requiresFollowUp = true;
//       }
//     });

//     // Calculate health scores and averages
//     Object.values(clientAnalytics).forEach(client => {
//       if (client.feedbackHistory.length > 0) {
//         const totalRating = client.feedbackHistory.reduce((sum, fb) => sum + fb.rating, 0);
//         client.averageRating = (totalRating / client.feedbackHistory.length).toFixed(2);
        
//         // Calculate health score (0-100)
//         const recentFeedback = client.feedbackHistory.slice(0, 5); // Last 5 feedback entries
//         const recentAvgRating = recentFeedback.reduce((sum, fb) => sum + fb.rating, 0) / recentFeedback.length;
//         const goodFeedbackRatio = recentFeedback.filter(fb => fb.type === 'Good').length / recentFeedback.length;
        
//         client.healthScore = Math.round((recentAvgRating * 20) + (goodFeedbackRatio * 40)); // Max 100
//       }
//     });

//     // Sort by health score (highest first)
//     const sortedAnalytics = Object.values(clientAnalytics).sort((a, b) => b.healthScore - a.healthScore);

//     res.status(200).json({
//       analytics: sortedAnalytics,
//       summary: {
//         totalClients: sortedAnalytics.length,
//         averageHealthScore: sortedAnalytics.length > 0 
//           ? (sortedAnalytics.reduce((sum, client) => sum + client.healthScore, 0) / sortedAnalytics.length).toFixed(2)
//           : 0,
//         clientsRequiringFollowUp: sortedAnalytics.filter(client => client.requiresFollowUp).length
//       }
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
