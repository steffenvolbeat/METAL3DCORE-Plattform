#!/bin/bash
echo "🚀 METAL3DCORE-PLATTFORM Production Deployment"
echo "=============================================="

# 1. Check if we're on the right branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "❌ Error: Not on main branch. Currently on: $BRANCH"
  echo "Please switch to main branch: git checkout main"
  exit 1
fi

# 2. Ensure everything is committed
if ! git diff-index --quiet HEAD --; then
  echo "❌ Error: Uncommitted changes detected!"
  echo "Please commit all changes before deployment."
  exit 1
fi

# 3. Run tests
echo "🧪 Running tests..."
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed! Deployment aborted."
  exit 1
fi

# 4. Build locally to check for errors
echo "🔨 Testing production build..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed! Deployment aborted."
  exit 1
fi

# 5. Generate Prisma Client
echo "🗄 Generating Prisma Client..."
npx prisma generate

# 6. Push to GitHub (triggers Vercel deployment)
echo "📤 Pushing to GitHub main branch..."
git push origin main

echo "✅ Local checks passed! Deployment initiated."
echo "🌐 Check Vercel Dashboard for deployment status."
echo "📊 Monitor logs: vercel logs your-project-url --follow"