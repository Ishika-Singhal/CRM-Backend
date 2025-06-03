
const { generateSegmentRules } = require('../services/geminiService'); // Import Gemini service
const { applySegmentationRules } = require('./campaignController'); // Re-use segmentation logic for preview

// Convert natural language input to structured segment rules using Gemini API
const naturalLanguageToSegmentRules = async (req, res, next) => {
  try {
    const { naturalLanguageQuery } = req.body;

    if (!naturalLanguageQuery) {
      return res.status(400).json({ message: 'Natural language query is required.', success: false });
    }

    // Call Gemini service to generate structured rules
    const generatedRules = await generateSegmentRules(naturalLanguageQuery);

    if (!generatedRules) {
      return res.status(500).json({ message: 'Failed to generate segment rules from AI.', success: false });
    }

    // Optionally, apply rules to get an audience size preview
    let audienceSize = 0;
    let sampleCustomerEmails = [];
    try {
      const audience = await applySegmentationRules(generatedRules);
      audienceSize = audience.length;
      sampleCustomerEmails = audience.slice(0, 5).map(c => c.email);
    } catch (previewError) {
      console.warn('Could not generate audience preview for AI-generated rules:', previewError);
      // Continue even if preview fails, the rules themselves are the primary output
    }


    res.status(200).json({
      message: 'Segment rules generated successfully from natural language.',
      success: true,
      segmentRules: generatedRules,
      audienceSize: audienceSize,
      sampleCustomerEmails: sampleCustomerEmails
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  naturalLanguageToSegmentRules
};
