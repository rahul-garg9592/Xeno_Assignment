// Personalization utilities for campaign messages
export const first_name = "{{first_name}}"

export const personalizeMessage = (template, customer) => {
  return template.replace(/\{\{first_name\}\}/g, customer.firstName || "there")
}

export const validateMessageTemplate = (template) => {
  // Check for valid personalization tokens
  const validTokens = ["{{first_name}}"]
  const tokens = template.match(/\{\{[^}]+\}\}/g) || []

  const invalidTokens = tokens.filter((token) => !validTokens.includes(token))

  return {
    isValid: invalidTokens.length === 0,
    invalidTokens,
    hasPersonalization: tokens.length > 0,
  }
}
