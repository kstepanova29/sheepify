// Script to help resize sheep sprite
// You can use this to create different sizes of your sheep sprite

const fs = require('fs');
const path = require('path');

// Instructions for resizing your sheep sprite:
console.log(`
🐑 SHEEP SPRITE RESIZE INSTRUCTIONS:

1. Save your 32x32 sheep sprite as: assets/images/sheep-sprite.png

2. Recommended sizes to create:
   - sheep-sprite-small.png (24x24) - for small displays
   - sheep-sprite-medium.png (48x48) - for medium displays  
   - sheep-sprite-large.png (96x96) - for large displays
   - sheep-sprite-xl.png (120x120) - for main display

3. You can use any image editor like:
   - Preview (macOS) - File > Export > Resize
   - GIMP (free) - Image > Scale Image
   - Photoshop - Image > Image Size
   - Online tools like resizeimage.net

4. Keep the pixel art style crisp by using "Nearest Neighbor" resizing
   (not smooth/bilinear interpolation)

5. The component will automatically handle the sizing in the app!
`);

// Check if the main sprite exists
const spritePath = path.join(__dirname, '../assets/images/sheep-sprite.png');
if (fs.existsSync(spritePath)) {
  console.log('✅ Found sheep-sprite.png');
} else {
  console.log('❌ Please add your sheep-sprite.png to assets/images/');
}
