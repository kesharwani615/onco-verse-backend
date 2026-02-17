const uploadService = (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      const fileUrls = req.files.map((file) => ({
        originalName: file.originalname,
        url: file.location,
        size: file.size,
        type: file.mimetype,
      }));

      return res.status(200).json({
        success: true,
        files: fileUrls,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

module.exports = uploadService;