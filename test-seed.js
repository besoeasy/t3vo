// Temporary test seed script
import { addPasswordEntry, addBookmarkEntry, addNoteEntry } from './src/db.js';

// Set a temporary encryption key for testing
sessionStorage.setItem("ENCRYPTION_KEY", "test-key-123");

async function seedTestData() {
  try {
    console.log("Adding test data...");
    
    // Add test password
    await addPasswordEntry({
      title: "Gmail Account",
      username: "user@example.com",
      email: "user@example.com",
      password: "super-secure-password-123",
      totpSecret: "JBSWY3DPEHPK3PXP",
      urls: "https://gmail.com\nhttps://mail.google.com"
    });
    
    // Add test bookmark
    await addBookmarkEntry({
      title: "GitHub",
      url: "https://github.com",
      note: "Popular code hosting platform for version control and collaboration"
    });
    
    // Add test note
    await addNoteEntry({
      title: "Meeting Notes",
      content: "Important points from today's meeting:\n- Discuss new features\n- Review current progress\n- Plan next sprint",
      tags: ["meeting", "work"]
    });
    
    console.log("Test data added successfully!");
  } catch (error) {
    console.error("Error adding test data:", error);
  }
}

seedTestData();
