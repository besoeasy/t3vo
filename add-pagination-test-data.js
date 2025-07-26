// Browser console script to add multiple pages of test data
// Copy and paste this into the browser console after unlocking the app

async function addMultiplePages() {
  console.log('Adding multiple pages of test data...');
  
  const { addPasswordEntry, addBookmarkEntry, addNoteEntry } = await import('./src/db.js');
  
  try {
    // Add 25 bookmarks (more than 2 pages)
    const bookmarkNames = [
      'Vue.js Documentation', 'React Documentation', 'Angular Documentation', 'Svelte Documentation',
      'GitHub', 'GitLab', 'Bitbucket', 'SourceForge',
      'Stack Overflow', 'Stack Exchange', 'Reddit Programming', 'Hacker News',
      'MDN Web Docs', 'W3Schools', 'CSS Tricks', 'Can I Use',
      'NPM', 'Yarn', 'PNPM', 'Node.js',
      'Vite', 'Webpack', 'Rollup', 'Parcel',
      'TypeScript Docs'
    ];
    
    for (let i = 0; i < bookmarkNames.length; i++) {
      await addBookmarkEntry({
        title: bookmarkNames[i],
        url: `https://${bookmarkNames[i].toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        note: `Documentation and resources for ${bookmarkNames[i]}`
      });
    }
    
    // Add 20 passwords (2 pages)
    const serviceNames = [
      'Gmail', 'GitHub', 'Netflix', 'Spotify', 'Amazon', 'Facebook', 'Twitter', 'LinkedIn',
      'Instagram', 'YouTube', 'Discord', 'Slack', 'Zoom', 'Dropbox', 'Google Drive',
      'OneDrive', 'Apple ID', 'Microsoft', 'Adobe', 'Figma'
    ];
    
    for (let i = 0; i < serviceNames.length; i++) {
      await addPasswordEntry({
        title: `${serviceNames[i]} Account`,
        username: `user${i + 1}@email.com`,
        email: `user${i + 1}@email.com`,
        password: `SecurePass${i + 1}!`,
        totpSecret: i % 3 === 0 ? 'JBSWY3DPEHPK3PXP' : '', // Add TOTP to every 3rd password
        urls: [`https://${serviceNames[i].toLowerCase()}.com`]
      });
    }
    
    // Add 15 notes 
    const noteTopics = [
      'Meeting Notes - Q1 Planning', 'Shopping List - Groceries', 'Book Reading List',
      'Travel Itinerary - Europe', 'Recipe - Pasta Carbonara', 'Learning Goals 2025',
      'Project Ideas - Side Projects', 'Health Goals - Fitness Plan', 'Gift Ideas - Birthday',
      'Code Snippets - JavaScript', 'Movie Watchlist', 'Podcast Recommendations',
      'Investment Research', 'Home Improvement Tasks', 'Weekly Meal Plan'
    ];
    
    for (let i = 0; i < noteTopics.length; i++) {
      await addNoteEntry({
        title: noteTopics[i],
        content: `This is detailed content for ${noteTopics[i]}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`,
        tags: ['test', 'sample', `tag${i + 1}`]
      });
    }
    
    console.log('Multiple pages of test data added successfully!');
    console.log(`Added: ${bookmarkNames.length} bookmarks, ${serviceNames.length} passwords, ${noteTopics.length} notes`);
    console.log('Refreshing page to show new data...');
    
    // Refresh the page to load the new data
    window.location.reload();
    
  } catch (error) {
    console.error('Error adding test data:', error);
  }
}

// Execute the function
addMultiplePages();
