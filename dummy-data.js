// Browser console script to add 100 dummy items for each type
// Copy and paste this into the browser console after unlocking the app

async function generateDummyData() {
  console.log('🚀 Starting to generate dummy data...');
  
  // Import the database functions
  const { addPasswordEntry, addBookmarkEntry, addNoteEntry } = await import('./src/db.js');
  
  try {
    // Generate 100 Passwords
    console.log('📝 Adding 100 dummy passwords...');
    const services = [
      'Gmail', 'GitHub', 'Netflix', 'Spotify', 'Amazon', 'Facebook', 'Twitter', 'LinkedIn',
      'Instagram', 'YouTube', 'Discord', 'Slack', 'Zoom', 'Dropbox', 'Google Drive',
      'OneDrive', 'Apple ID', 'Microsoft', 'Adobe', 'Figma', 'Notion', 'Trello',
      'Asana', 'Jira', 'Confluence', 'BitBucket', 'GitLab', 'Stack Overflow',
      'Reddit', 'Pinterest', 'TikTok', 'Snapchat', 'WhatsApp', 'Telegram',
      'Signal', 'Skype', 'Teams', 'Webex', 'GoToMeeting', 'Calendly',
      'Mailchimp', 'Constant Contact', 'Salesforce', 'HubSpot', 'Zendesk',
      'Freshworks', 'Intercom', 'Stripe', 'PayPal', 'Square'
    ];
    
    const domains = ['com', 'org', 'net', 'io', 'co', 'app'];
    const adjectives = ['secure', 'strong', 'complex', 'unique', 'random', 'encrypted'];
    
    for (let i = 0; i < 100; i++) {
      const service = services[i % services.length];
      const variation = i > services.length ? ` ${Math.floor(i / services.length) + 1}` : '';
      const domain = domains[i % domains.length];
      const adjective = adjectives[i % adjectives.length];
      
      await addPasswordEntry({
        title: `${service}${variation} Account`,
        username: `user${i + 1}@email.${domain}`,
        email: `user${i + 1}@email.${domain}`,
        password: `${adjective}Pass${i + 1}!${String.fromCharCode(65 + (i % 26))}`,
        totpSecret: i % 4 === 0 ? 'JBSWY3DPEHPK3PXP' : '', // Add TOTP to every 4th password
        urls: [`https://${service.toLowerCase().replace(/\s+/g, '')}.${domain}`, `https://app.${service.toLowerCase().replace(/\s+/g, '')}.${domain}`]
      });
      
      if (i % 10 === 9) {
        console.log(`✅ Added ${i + 1} passwords...`);
      }
    }
    
    // Generate 100 Bookmarks
    console.log('🔖 Adding 100 dummy bookmarks...');
    const categories = [
      'Development', 'Design', 'Productivity', 'News', 'Entertainment', 'Education',
      'Business', 'Finance', 'Health', 'Travel', 'Food', 'Sports', 'Technology',
      'Science', 'Art', 'Music', 'Movies', 'Books', 'Gaming', 'Social'
    ];
    
    const websiteTypes = [
      'Documentation', 'Tutorial', 'Blog', 'Tool', 'Resource', 'Community',
      'Platform', 'Service', 'App', 'Library', 'Framework', 'API', 'Guide',
      'Reference', 'Course', 'Podcast', 'Newsletter', 'Forum', 'Marketplace', 'Dashboard'
    ];
    
    for (let i = 0; i < 100; i++) {
      const category = categories[i % categories.length];
      const type = websiteTypes[i % websiteTypes.length];
      const num = Math.floor(i / categories.length) + 1;
      const tld = domains[i % domains.length];
      
      await addBookmarkEntry({
        title: `${category} ${type}${num > 1 ? ` ${num}` : ''}`,
        url: `https://${category.toLowerCase()}${type.toLowerCase()}${i + 1}.${tld}`,
        note: `Useful ${type.toLowerCase()} for ${category.toLowerCase()} related tasks and resources. Bookmarked on ${new Date().toLocaleDateString()} for future reference.`
      });
      
      if (i % 10 === 9) {
        console.log(`✅ Added ${i + 1} bookmarks...`);
      }
    }
    
    // Generate 100 Notes
    console.log('📄 Adding 100 dummy notes...');
    const noteTypes = [
      'Meeting Notes', 'Project Ideas', 'Code Snippets', 'Learning Notes', 'Todo List',
      'Research Notes', 'Design Ideas', 'Bug Reports', 'Feature Requests', 'Reminders',
      'Shopping List', 'Travel Plans', 'Recipe Notes', 'Book Notes', 'Movie Reviews',
      'Workout Plans', 'Financial Notes', 'Health Records', 'Contact Info', 'Quotes'
    ];
    
    const topics = [
      'Q1 Planning', 'Team Standup', 'Client Review', 'Architecture Design', 'User Research',
      'Performance Optimization', 'Security Audit', 'Database Migration', 'API Integration',
      'UI Improvements', 'Testing Strategy', 'Deployment Process', 'Code Review',
      'Technical Debt', 'Feature Planning', 'Bug Triage', 'Sprint Retrospective',
      'Market Analysis', 'Competitor Research', 'User Feedback'
    ];
    
    const sampleContent = [
      'Key points to remember and follow up on.',
      'Important details discussed in the meeting.',
      'Next steps and action items for the team.',
      'Decisions made and their rationale.',
      'Resources and links for future reference.',
      'Ideas to explore and validate.',
      'Issues to investigate and resolve.',
      'Opportunities for improvement.',
      'Best practices and lessons learned.',
      'Goals and objectives for the period.'
    ];
    
    for (let i = 0; i < 100; i++) {
      const noteType = noteTypes[i % noteTypes.length];
      const topic = topics[i % topics.length];
      const content = sampleContent[i % sampleContent.length];
      const variation = Math.floor(i / noteTypes.length) + 1;
      
      const fullContent = `${content}

📋 ${noteType} Details:
• Priority: ${['High', 'Medium', 'Low'][i % 3]}
• Status: ${['In Progress', 'Pending', 'Completed', 'On Hold'][i % 4]}
• Category: ${noteType}
• Created: ${new Date().toLocaleDateString()}

🔍 Additional Information:
This note contains important information about ${topic.toLowerCase()}. 
Review regularly and update as needed.

📝 Follow-up Actions:
${i % 3 === 0 ? '- Schedule follow-up meeting\n- Review with stakeholders\n- Update documentation' : 
  i % 3 === 1 ? '- Gather more requirements\n- Research best practices\n- Create implementation plan' :
  '- Test current solution\n- Monitor performance\n- Document lessons learned'}

Tags: #${noteType.toLowerCase().replace(/\s+/g, '')} #${topic.toLowerCase().replace(/\s+/g, '')} #note${i + 1}`;
      
      await addNoteEntry({
        title: `${noteType}${variation > 1 ? ` ${variation}` : ''} - ${topic}`,
        content: fullContent,
        tags: [noteType.toLowerCase(), topic.toLowerCase(), `note${i + 1}`]
      });
      
      if (i % 10 === 9) {
        console.log(`✅ Added ${i + 1} notes...`);
      }
    }
    
    console.log('🎉 Successfully generated dummy data!');
    console.log('📊 Summary:');
    console.log('  • 100 Passwords with varied services and security levels');
    console.log('  • 100 Bookmarks across different categories and types');
    console.log('  • 100 Notes with detailed content and tags');
    console.log('');
    console.log('💡 Tip: You can now test pagination, search, and filtering features!');
    
  } catch (error) {
    console.error('❌ Error generating dummy data:', error);
    console.log('Make sure you have unlocked the app first!');
  }
}

// Auto-run the function
generateDummyData();
