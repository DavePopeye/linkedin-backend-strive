const PDFDocument = require("pdfkit");
const a4 = { width: 595, height: 842 };
const padding = { top: a4.height * 0.05 };
const { join } = require("path");
const { parseImage } = require("../utils");
const Languages = require("../services/languages/model");
const Certifications = require("../services/certifications/model");
const fs = require("fs");
const { promisify } = require("util");
const fileExists = promisify(fs.exists);
const axios = require("axios");
const generateCV = async (user) => {
  try {
    const doc = new PDFDocument();
    doc.font("Helvetica");
    let grad = doc.linearGradient(50, 0, 150, 100);
    grad.stop(0, "#283e4a").stop(1, "#19282d");
    doc.rect(0, 0, a4.width * 0.35, a4.height);
    doc.fill(grad);
    const imagePath = join(
      __dirname,
      "../files/photos",
      parseImage(user.image)
    );

    const placeholder = join(__dirname, "../assets/", "placeholder.png");

    const imageExists = await fileExists(imagePath);
    if (imageExists) {
      doc.image(imagePath, a4.width * 0.05, a4.height * 0.05, { scale: 0.25 });
    } else {
      doc.image(placeholder, a4.width * 0.05, a4.height * 0.05, {
        scale: 0.5,
      });
    }
    doc.fontSize(8);
    //0xE2 0x9C 0x89

    doc
      .fillColor("#fff")
      .text(`Email : ${user.email}`, a4.width * 0.05, a4.height * 0.2);
    doc.fontSize(18);
    doc
      .fillColor("#fff")
      .font("Helvetica-Bold")
      .text(`Experiences`, a4.width * 0.05, a4.height * 0.24);

    doc.fontSize(10);
    let y = 0;
    const languages = await Languages.find({ createdBy: user._id });
    user.experiences.map((experience, i) => {
      doc.fillColor("#fff").font("Helvetica").text(`${experience.company}\n`);
      y = a4.height * 0.2 + a4.height * (i + 1) * 0.05;
    });
    doc.fontSize(18);
    doc
      .fillColor("#fff")
      .font("Helvetica-Bold")
      .text(`Languages`, a4.width * 0.05, y + a4.height * 0.05);
    doc.fontSize(10);
    y = y + a4.height * 0.05;
    languages.map(({ language, proficiency }, i) => {
      doc
        .fillColor("#fff")
        .font("Helvetica")
        .text(`${language}-${proficiency}\n`);
    });

    doc.fillColor("#283e4a");
    doc.fontSize(20);
    doc.font("Helvetica-Bold");
    doc.text(`${user.name} ${user.lastName}`, a4.width * 0.4, a4.height * 0.05);
    doc.fontSize(12);
    doc.font("Helvetica");
    doc.text(`${user.title || ""}`, a4.width * 0.4, a4.height * 0.08);
    doc.text(`${user.area || ""}`, a4.width * 0.4, a4.height * 0.1);
    doc.fontSize(18);
    doc
      .font("Helvetica-Bold")
      .text(`Biography`, a4.width * 0.4, a4.height * 0.14);
    doc.fontSize(12);
    doc.font("Helvetica");
    doc.text(`${user.bio || ""}\n\n`, a4.width * 0.4, a4.height * 0.18);
    doc.fontSize(18).font("Helvetica-Bold").text(`Certificates\n\n`);
    const certificates = await Certifications.find({ createdBy: user._id });
    certificates.map((certificate) => {
      doc.fontSize(12).font("Helvetica").text(`${certificate.name}\n\n`);
    });
    return doc;
  } catch (e) {
    throw new Error(e);
  }
};

module.exports = { generateCV };
