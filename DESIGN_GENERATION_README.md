# 🎨 JamDung Jobs Design Generation Guide

## Overview
This guide explains how to generate UI/UX design prototypes for JamDung Jobs using Ideogram AI 3.0 through the Replicate API.

## Prerequisites
1. **Replicate API Token**: Set your `REPLICATE_API_TOKEN` environment variable
   ```bash
   export REPLICATE_API_TOKEN="your_token_here"
   ```

2. **Python Dependencies**: Install required packages
   ```bash
   pip install replicate requests pathlib
   ```

## Design Categories

### 🏠 Homepage Designs
- **Tropical Paradise**: Caribbean aesthetic with palm trees and hibiscus
- **Minimalist Professional**: Clean, corporate design with Jamaican accents
- **Cultural Heritage**: Blue Mountains and Kingston harbor imagery

### 👤 Job Seeker Interfaces
- **Modern Dashboard**: Clean Material Design with job cards
- **Vibrant Profile**: Motivational design with skills visualization

### 🏢 Employer Dashboards
- **Executive Dashboard**: Dark theme with analytics and metrics
- **Intuitive Job Posting**: Step-by-step wizard interface

### 🎯 Brand Identity
- **Logo Concepts**: Multiple variations of JamDung Jobs branding
- **Marketing Banners**: Success stories and aspirational imagery

### 📱 Mobile App Screens
- **Onboarding Flow**: Welcome, role selection, and setup screens
- **Job Search Results**: Mobile-optimized job listings

## Running the Generator

```bash
cd /Users/mcameron/jamdungjobs
python generate_designs.py
```

## Output
- **Generated Images**: Saved to `web-frontend/public/images/generated/`
- **Log File**: `design_generation_log.txt` contains all generation details
- **Web Accessible**: Images available at `/images/generated/` in the app

## Design Specifications

### Color Palette
- **Jamaican Green**: #009639
- **Jamaican Gold**: #FFD700
- **Black**: #000000
- **White**: #FFFFFF

### Aspect Ratios
- **Mobile Screens**: 9:16 (portrait)
- **Desktop/Web**: 16:9 (landscape)
- **Logos**: 1:1 (square)

### Typography Principles
- **Headers**: Bold, confident typography
- **Body**: Clean, readable fonts (Poppins, Inter)
- **Taglines**: Authentic Jamaican voice

## Cultural Elements
- **Local References**: Kingston, Spanish Town, Montego Bay, Blue Mountains
- **Authentic Language**: "Where your next opportunity soon come"
- **Professional Pride**: Celebrating Jamaican work culture
- **Inclusive Design**: Accessible to all Jamaicans

## Integration with Current App
Generated designs can be used as:
1. **Visual References**: For implementing new UI components
2. **A/B Testing**: Different homepage and dashboard variants
3. **Marketing Materials**: Banners and promotional content
4. **Brand Guidelines**: Logo and color scheme variations

## Next Steps
1. Review generated designs
2. Select preferred concepts
3. Implement chosen designs in React components
4. Test with Jamaican users for cultural authenticity
5. Iterate based on feedback

---

*"Where your next opportunity soon come"* 🇯🇲
