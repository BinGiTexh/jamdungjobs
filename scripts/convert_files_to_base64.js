const fs = require('fs');
const path = require('path');

// File paths
const photoPath = path.resolve(process.env.HOME, 'Downloads/IMG_8667.JPG');
const resumePath = path.resolve(process.env.HOME, 'Documents/Malik_Personal/malik_cameron_resume.pdf');

// Read and convert photo to base64
try {
  const photoBuffer = fs.readFileSync(photoPath);
  const photoBase64 = `data:image/jpeg;base64,${photoBuffer.toString('base64')}`;
  
  // Save to a file for easy copying
  fs.writeFileSync(
    path.resolve(__dirname, 'photo_base64.txt'), 
    photoBase64
  );
  console.log('Photo converted to base64 and saved to scripts/photo_base64.txt');
} catch (error) {
  console.error('Error processing photo:', error.message);
}

// Read and convert resume to base64
try {
  const resumeBuffer = fs.readFileSync(resumePath);
  const resumeBase64 = `data:application/pdf;base64,${resumeBuffer.toString('base64')}`;
  
  // Save to a file for easy copying
  fs.writeFileSync(
    path.resolve(__dirname, 'resume_base64.txt'), 
    resumeBase64
  );
  console.log('Resume converted to base64 and saved to scripts/resume_base64.txt');
  console.log('Resume filename:', path.basename(resumePath));
} catch (error) {
  console.error('Error processing resume:', error.message);
}
