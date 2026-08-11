const Message = require("../models/Message.model");
const Delivery = require("../models/Delivery.model");
const { success, error } = require("../utils/apiResponse");

const getParticipantIds = (delivery) => [
  delivery.donorId.toString(),
  delivery.ngoId.toString(),
  delivery.volunteerId ? delivery.volunteerId.toString() : null,
];

// @desc    Get chat history for a delivery
// @route   GET /api/chat/:deliveryId
// @access  Private (participants only)
exports.getChatHistory = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.deliveryId);
    if (!delivery) return error(res, 404, "Delivery not found");

    if (!getParticipantIds(delivery).includes(req.user.id)) {
      return error(res, 403, "Not authorized to view this chat");
    }

    const messages = await Message.find({ deliveryId: req.params.deliveryId })
      .populate("senderId", "name role")
      .sort({ createdAt: 1 });

    return success(res, 200, "Chat history fetched", messages);
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Send a message (also called internally by Socket.IO handler)
// @route   POST /api/chat/:deliveryId
// @access  Private (participants only)
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return error(res, 400, "Message text is required");

    const delivery = await Delivery.findById(req.params.deliveryId);
    if (!delivery) return error(res, 404, "Delivery not found");

    const participantIds = getParticipantIds(delivery);
    if (!participantIds.includes(req.user.id)) {
      return error(res, 403, "Not authorized to chat on this delivery");
    }

    const roleMap = {
      [delivery.donorId.toString()]: "donor",
      [delivery.ngoId.toString()]: "ngo",
      [delivery.volunteerId ? delivery.volunteerId.toString() : ""]: "volunteer",
    };

    const message = await Message.create({
      deliveryId: delivery._id,
      senderId: req.user.id,
      senderRole: roleMap[req.user.id],
      text: text.trim(),
      readBy: [req.user.id],
    });

    const populated = await message.populate("senderId", "name role");

    return success(res, 201, "Message sent", populated);
  } catch (err) {
    return error(res, 500, err.message);
  }
};