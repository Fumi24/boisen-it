# Contributing Guide

Thank you for your interest in contributing to the Interactive Pipeline Website project!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/interactive-pipeline.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Follow the [SETUP.md](./SETUP.md) guide to get the project running locally

## Development Workflow

### Making Changes

1. **Frontend Changes** (React components)
   - Files in `src/` directory
   - Run `npm run dev` to see changes live
   - Follow React best practices and hooks patterns

2. **Backend Changes** (Cloudflare Worker)
   - Files in `worker/` directory
   - Run `npm run worker:dev` to test locally
   - Remember to restart worker after changes

3. **Styling Changes**
   - CSS files co-located with components
   - Use CSS variables defined in `src/index.css`
   - Maintain dark theme consistency

### Code Style

We use Prettier for code formatting:

```bash
npx prettier --write .
```

**Code Guidelines:**
- Use functional components (no class components)
- Prefer const over let
- Use descriptive variable names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages

Follow conventional commits format:

```
feat: add new pipeline stage
fix: resolve SSE disconnection issue
docs: update deployment guide
style: format code with prettier
refactor: simplify state management
test: add pipeline state tests
chore: update dependencies
```

## Adding New Features

### Adding a New Pipeline Stage

1. Update `STAGES` array in `worker/pipeline-durable-object.js`:
```javascript
const STAGES = ['queued', 'building', 'testing', 'NEW_STAGE', 'deploying', 'live']
```

2. Update visualization in `src/components/PipelineVisualizer.jsx`:
```javascript
const STAGES = [
  // ...existing stages
  { id: 'new_stage', label: 'NEW STAGE', color: '#hexcolor' }
]
```

3. Update infrastructure mapping if needed:
```javascript
updateActiveInfrastructure(stage) {
  const infraMap = {
    'new_stage': {
      nodes: ['worker', 'durable'],
      connections: ['worker-durable']
    }
  }
}
```

### Adding a New Infrastructure Component

1. Add to `INFRASTRUCTURE_NODES` in `src/components/InfrastructureMap.jsx`:
```javascript
{ id: 'new_component', label: 'New Component', type: 'backend', x: 0.5, y: 0.5 }
```

2. Add connection if needed:
```javascript
{ from: 'worker', to: 'new_component' }
```

3. Update type colors if introducing new type:
```javascript
const TYPE_COLORS = {
  // ...existing types
  'new_type': '#hexcolor'
}
```

### Adding a New API Endpoint

1. Add route handler in `worker/index.js`:
```javascript
if (url.pathname === '/api/new-endpoint' && request.method === 'POST') {
  return handleNewEndpoint(request, env)
}
```

2. Implement handler function:
```javascript
async function handleNewEndpoint(request, env) {
  const data = await request.json()

  // Your logic here

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}
```

3. Add frontend integration in React component:
```javascript
const response = await fetch('/api/new-endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
```

## Testing

Currently, the project uses manual testing. Contributions for automated testing are welcome!

### Manual Testing Checklist

- [ ] Pipeline triggers successfully
- [ ] All stages complete in sequence
- [ ] Logs appear in real-time
- [ ] Infrastructure map updates correctly
- [ ] Config changes persist
- [ ] SSE reconnects after disconnection
- [ ] Works in Chrome, Firefox, Safari
- [ ] Mobile responsive
- [ ] No console errors

### Future: Automated Testing

We plan to add:
- Unit tests (Vitest)
- E2E tests (Playwright)
- Worker tests (Miniflare)

## Documentation

When adding features, update:

- `README.md` - High-level overview
- `FEATURES.md` - Technical details
- `DEPLOYMENT.md` - If affecting deployment
- Code comments - For complex logic
- JSDoc comments - For functions

## Pull Request Process

1. **Update Documentation**: Ensure all docs are current
2. **Test Thoroughly**: Follow manual testing checklist
3. **Keep PRs Focused**: One feature/fix per PR
4. **Write Clear Description**: Explain what and why
5. **Reference Issues**: Link to related issues

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing done

## Screenshots
If applicable, add screenshots

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Tested locally
```

## Code Review Process

- PRs require review before merging
- Address feedback promptly
- Be respectful and constructive
- Learn from reviews

## Areas for Contribution

### Good First Issues

- Improve error messages
- Add loading states
- Enhance mobile responsiveness
- Add keyboard shortcuts
- Improve accessibility

### Medium Complexity

- Add pipeline history view
- Implement search in logs
- Add export functionality
- Create custom themes
- Add animations

### Advanced

- Real GitHub Actions integration
- Multi-user sessions with auth
- Advanced analytics dashboard
- WebSocket fallback for SSE
- Performance monitoring

## Community Guidelines

- Be respectful and inclusive
- Help newcomers
- Give constructive feedback
- Assume good intentions
- Follow code of conduct

## Questions?

- Open an issue for bugs
- Start a discussion for feature ideas
- Ask in pull request comments

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Interactive Pipeline Website! 🚀
