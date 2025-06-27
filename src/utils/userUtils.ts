/**
 * Generate a consistent user ID based on email
 * This ensures the same email always gets the same ID across sessions
 */
export const generateConsistentUserId = (email: string): number => {
  // Simple hash function to convert email to a consistent number
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Ensure positive number and add offset to avoid conflicts with default users (1, 2)
  const userId = Math.abs(hash) + 1000;
  return userId;
};

/**
 * Get or create a user with consistent ID based on email
 */
export const getOrCreateUser = (
  name: string, 
  email: string, 
  existingUsers: any[], 
  PSPDFKit: any,
  randomColor: (PSPDFKit: any, usedColors: any[]) => any
) => {
  const consistentId = generateConsistentUserId(email);
  
  // Check if user already exists by ID or email
  const existingUser = existingUsers.find(user => 
    user.id === consistentId || user.email === email
  );
  
  if (existingUser) {
    return existingUser;
  }
  
  // Create new user with consistent ID
  return {
    id: consistentId,
    name,
    email,
    color: randomColor(PSPDFKit, existingUsers.map(u => u.color)),
    role: "signee",
  };
};

/**
 * Find user by email to handle re-uploaded documents where user IDs might not match
 */
export const findUserByEmail = (email: string, users: any[]) => {
  return users.find(user => user.email === email);
};

/**
 * Find user by ID or email (fallback) for annotation rendering
 */
export const findUserByIdOrEmail = (signerID: number, signerEmail: string, users: any[]) => {
  // First try to find by ID
  let user = users.find(user => user.id === signerID);
  
  // If not found by ID, try to find by email (for re-uploaded documents)
  if (!user && signerEmail) {
    user = findUserByEmail(signerEmail, users);
  }
  
  return user;
};

/**
 * Initialize default users with fixed IDs to ensure consistency
 */
export const getDefaultUsers = () => [
  {
    id: 1,
    name: "Admin",
    email: "admin@email.com",
    role: "Editor",
  },
  {
    id: 2,
    name: "Signer 1", 
    email: "signer1@email.com",
    role: "Signer",
  },
];