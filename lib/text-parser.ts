export interface MenuItem {
  name: string
  price: number
  description?: string
  category?: string
}

export interface ParsedContent {
  menuItems: MenuItem[]
  restaurants: Array<{
    name: string
    cuisine?: string
    rating?: number
    deliveryTime?: string
  }>
  plainText: string
  filteredText: string // Text with menu items removed to avoid duplication
}

/**
 * Parse text from API response to extract structured data like menu items, restaurants, etc.
 */
export function parseApiResponse(text: string): ParsedContent {
  const result: ParsedContent = {
    menuItems: [],
    restaurants: [],
    plainText: text,
    filteredText: text,
  }

  // Try to extract menu items with prices
  // Patterns like: "Item Name - $12.99" or "Item Name $12.99" or "Item Name: $12.99"
  const menuItemPatterns = [
    /^([^$]+?)\s*[-:]\s*\$\s*(\d+\.?\d*)/gm, // "Item - $12.99"
    /^([^$]+?)\s+\$\s*(\d+\.?\d*)/gm, // "Item $12.99"
    /^([^$]+?)\s*\(\$\s*(\d+\.?\d*)\)/gm, // "Item ($12.99)"
  ]

  for (const pattern of menuItemPatterns) {
    const matches = [...text.matchAll(pattern)]
    for (const match of matches) {
      const name = match[1]?.trim()
      const price = parseFloat(match[2] || "0")
      if (name && price > 0 && !result.menuItems.find((item) => item.name === name)) {
        result.menuItems.push({ name, price })
      }
    }
  }

  // Try to extract restaurant names (lines that look like restaurant names)
  // Usually appear as headers or in lists
  const restaurantPatterns = [
    /^#+\s*(.+)$/gm, // Markdown headers
    /^##\s*(.+)$/gm, // H2 headers
    /^(.+?)\s*[-–—]\s*(Japanese|Italian|Chinese|Mexican|American|Thai|Indian|Korean|Mediterranean|Fast Food|Pizza|Sushi|Burgers)/gi, // "Name - Cuisine"
  ]

  for (const pattern of restaurantPatterns) {
    const matches = [...text.matchAll(pattern)]
    for (const match of matches) {
      const name = match[1]?.trim()
      const cuisine = match[2]?.trim()
      if (name && name.length > 2 && name.length < 50) {
        if (!result.restaurants.find((r) => r.name === name)) {
          result.restaurants.push({ name, cuisine })
        }
      }
    }
  }

  // Extract menu items from markdown lists (more flexible patterns)
  const listItemPatterns = [
    /^[-*]\s*([^$]+?)\s*[-:]\s*\$\s*(\d+\.?\d*)/gm, // "- Item - $12.99"
    /^[-*]\s*([^$]+?)\s+\(\$\s*(\d+\.?\d*)\)/gm, // "- Item ($12.99)"
    /^[-*]\s*([^$]+?)\s+\$\s*(\d+\.?\d*)/gm, // "- Item $12.99"
  ]

  for (const pattern of listItemPatterns) {
    const matches = [...text.matchAll(pattern)]
    for (const match of matches) {
      const name = match[1]?.trim()
      const price = parseFloat(match[2] || "0")
      if (name && price > 0 && name.length > 2 && !result.menuItems.find((item) => item.name === name)) {
        result.menuItems.push({ name, price })
      }
    }
  }

  // Extract menu items from numbered lists
  const numberedListPatterns = [
    /^\d+\.\s*([^$]+?)\s*[-:]\s*\$\s*(\d+\.?\d*)/gm, // "1. Item - $12.99"
    /^\d+\.\s*([^$]+?)\s+\(\$\s*(\d+\.?\d*)\)/gm, // "1. Item ($12.99)"
    /^\d+\.\s*([^$]+?)\s+\$\s*(\d+\.?\d*)/gm, // "1. Item $12.99"
  ]

  for (const pattern of numberedListPatterns) {
    const matches = [...text.matchAll(pattern)]
    for (const match of matches) {
      const name = match[1]?.trim()
      const price = parseFloat(match[2] || "0")
      if (name && price > 0 && name.length > 2 && !result.menuItems.find((item) => item.name === name)) {
        result.menuItems.push({ name, price })
      }
    }
  }

  // Extract menu items from table-like formats (Item | Price)
  const tablePattern = /\|([^|]+)\|\s*\$?\s*(\d+\.?\d*)\s*\|/g
  const tableMatches = [...text.matchAll(tablePattern)]
  for (const match of tableMatches) {
    const name = match[1]?.trim()
    const price = parseFloat(match[2] || "0")
    if (name && price > 0 && name.length > 2 && !result.menuItems.find((item) => item.name === name)) {
      result.menuItems.push({ name, price })
    }
  }

  // Remove menu items from filtered text to avoid duplication when displaying cards
  if (result.menuItems.length > 0) {
    let filteredText = text
    for (const item of result.menuItems) {
      // Remove lines that match the menu item pattern
      const patterns = [
        new RegExp(`^[-*]\\s*${item.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[-:]\\s*\\$\\s*${item.price.toFixed(2).replace(/\./g, "\\.?")}.*$`, "gmi"),
        new RegExp(`^\\d+\\.\\s*${item.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[-:]\\s*\\$\\s*${item.price.toFixed(2).replace(/\./g, "\\.?")}.*$`, "gmi"),
        new RegExp(`${item.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[-:]\\s*\\$\\s*${item.price.toFixed(2).replace(/\./g, "\\.?")}`, "gmi"),
      ]
      for (const pattern of patterns) {
        filteredText = filteredText.replace(pattern, "")
      }
    }
    // Clean up extra blank lines
    filteredText = filteredText.replace(/\n{3,}/g, "\n\n").trim()
    result.filteredText = filteredText || text // Fallback to original if all text was removed
  }

  return result
}
