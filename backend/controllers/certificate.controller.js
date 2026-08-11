const PDFDocument = require("pdfkit");
const Food = require("../models/Food.model");
const User = require("../models/User.model");
const { error } = require("../utils/apiResponse");

// @desc    Get donor's donation history summary
// @route   GET /api/certificate/history
// @access  Private (donor)
exports.getDonationHistory = async (req, res) => {
  try {
    const foods = await Food.find({ donorId: req.user.id, status: "completed" }).sort({
      createdAt: -1,
    });

    const totalMeals = foods.reduce((sum, f) => sum + f.quantity, 0);
    const totalDonations = foods.length;

    res.status(200).json({
      success: true,
      message: "Donation history fetched",
      data: { totalDonations, totalMeals, foods },
    });
  } catch (err) {
    return error(res, 500, err.message);
  }
};

// @desc    Generate a downloadable PDF impact certificate
// @route   GET /api/certificate/download
// @access  Private (donor)
exports.downloadCertificate = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const foods = await Food.find({ donorId: req.user.id, status: "completed" });

    const totalMeals = foods.reduce((sum, f) => sum + f.quantity, 0);
    const totalDonations = foods.length;

    if (totalDonations === 0) {
      return error(res, 400, "No completed donations yet — nothing to certify");
    }

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=impact-certificate.pdf");

    doc.pipe(res);

    // Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke("#2e7d32");

    doc
      .fontSize(28)
      .fillColor("#2e7d32")
      .text("Certificate of Appreciation", { align: "center" });

    doc.moveDown(1);
    doc.fontSize(14).fillColor("#333").text("This certifies that", { align: "center" });

    doc.moveDown(0.5);
    doc
      .fontSize(24)
      .fillColor("#ff8f00")
      .text(user.organizationName || user.name, { align: "center" });

    doc.moveDown(1);
    doc
      .fontSize(14)
      .fillColor("#333")
      .text(
        `has generously donated ${totalMeals} meals across ${totalDonations} donation${
          totalDonations !== 1 ? "s" : ""
        }, helping fight hunger and reduce food waste through the Food Donation Platform.`,
        { align: "center", width: 450, indent: 50 }
      );

    doc.moveDown(2);
    doc
      .fontSize(12)
      .fillColor("#666")
      .text(`Issued on: ${new Date().toLocaleDateString()}`, { align: "center" });

    doc.moveDown(3);
    doc
      .fontSize(12)
      .fillColor("#2e7d32")
      .text("— Food Donation Platform Team", { align: "center" });

    doc.end();
  } catch (err) {
    return error(res, 500, err.message);
  }
};