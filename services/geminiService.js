
const fetch = require('node-fetch'); 
const generateSegmentRules = async (naturalLanguageQuery) => {
  const apiKey = process.env.GEMINI_API_KEY; 
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
    throw new Error("Gemini API key is missing.");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  
  const prompt = `Convert the following natural language query into a JSON object representing customer segmentation rules.
  The rules should follow this structure:
  {
    "operator": "AND" | "OR",
    "rules": [
      {
        "field": "totalSpend" | "totalVisits" | "lastActivity" | "email" | "name" | "address" | "phone",
        "condition": "EQ" | "NE" | "GT" | "LT" | "GTE" | "LTE" | "CONTAINS" | "NOCONTAINS" | "INACTIVE_DAYS" | "ACTIVE_DAYS",
        "value": "string" | number
      },
      // Nested rules are allowed for complex conditions
      {
        "operator": "AND" | "OR",
        "rules": [
          // ... nested rules
        ]
      }
    ]
  }

  Available fields:
  - "totalSpend": (number) Total amount spent by the customer.
  - "totalVisits": (number) Total number of visits/orders.
  - "lastActivity": (date) Timestamp of the customer's last interaction.
  - "email": (string) Customer's email.
  - "name": (string) Customer's name.
  - "address": (string) Customer's address.
  - "phone": (string) Customer's phone number.

  Available conditions:
  - "EQ": Equals
  - "NE": Not Equals
  - "GT": Greater Than
  - "LT": Less Than
  - "GTE": Greater Than or Equal To
  - "LTE": Less Than or Equal To
  - "CONTAINS": String contains (case-insensitive)
  - "NOCONTAINS": String does not contain (case-insensitive)
  - "INACTIVE_DAYS": Customer's last activity was X days ago or more (value is number of days).
  - "ACTIVE_DAYS": Customer's last activity was within X days (value is number of days).

  Examples:
  Input: "people who haven't shopped in 6 months and spent over ₹5K"
  Output:
  {
    "operator": "AND",
    "rules": [
      { "field": "lastActivity", "condition": "INACTIVE_DAYS", "value": 180 },
      { "field": "totalSpend", "condition": "GT", "value": 5000 }
    ]
  }

  Input: "customers who visited more than 5 times or have an email ending with @example.com"
  Output:
  {
    "operator": "OR",
    "rules": [
      { "field": "totalVisits", "condition": "GT", "value": 5 },
      { "field": "email", "condition": "CONTAINS", "value": "@example.com" }
    ]
  }

  Input: "customers named John Doe and spent less than 100"
  Output:
  {
    "operator": "AND",
    "rules": [
      { "field": "name", "condition": "EQ", "value": "John Doe" },
      { "field": "totalSpend", "condition": "LT", "value": 100 }
    ]
  }

  Input: "${naturalLanguageQuery}"
  Output:
  `;

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json", 
      responseSchema: { 
        type: "OBJECT",
        properties: {
          operator: { type: "STRING", enum: ["AND", "OR"] },
          rules: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                field: { type: "STRING", enum: ["totalSpend", "totalVisits", "lastActivity", "email", "name", "address", "phone"] },
                condition: { type: "STRING", enum: ["EQ", "NE", "GT", "LT", "GTE", "LTE", "CONTAINS", "NOCONTAINS", "INACTIVE_DAYS", "ACTIVE_DAYS"] },
                value: { type: ["STRING", "NUMBER", "BOOLEAN"] }, 
                operator: { type: "STRING", enum: ["AND", "OR"] }, 
                rules: { type: "ARRAY" }
              },
              required: ["field", "condition", "value"] 
            }
          }
        },
        required: ["operator", "rules"]
      }
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} - ${errorText}`);
      throw new Error(`Gemini API request failed with status ${response.status}`);
    }

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      const jsonString = result.candidates[0].content.parts[0].text;
      try {
        const parsedJson = JSON.parse(jsonString);
        return parsedJson;
      } catch (parseError) {
        console.error("Failed to parse Gemini API response as JSON:", jsonString, parseError);
        return null;
      }
    } else {
      console.warn("No content found in Gemini API response:", result);
      return null;
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

module.exports = {
  generateSegmentRules
};
