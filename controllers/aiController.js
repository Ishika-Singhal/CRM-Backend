
const { generateSegmentRules } = require('../services/geminiService'); 
const { applySegmentationRules } = require('./campaignController'); 

const naturalLanguageToSegmentRules = async (req, res, next) => {
  try {
    const { naturalLanguageQuery } = req.body;

    if (!naturalLanguageQuery) {
      return res.status(400).json({ message: 'Natural language query is required.', success: false });
    }

    
    const generatedRules = await generateSegmentRules(naturalLanguageQuery);

    if (!generatedRules) {
      return res.status(500).json({ message: 'Failed to generate segment rules from AI.', success: false });
    }

    let audienceSize = 0;
    let sampleCustomerEmails = [];
    try {
      const audience = await applySegmentationRules(generatedRules);
      audienceSize = audience.length;
      sampleCustomerEmails = audience.slice(0, 5).map(c => c.email);
    } catch (previewError) {
      console.warn('Could not generate audience preview for AI-generated rules:', previewError);
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
