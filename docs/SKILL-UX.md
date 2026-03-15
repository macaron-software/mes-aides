---
name: ux-laws
description: Apply UX laws and cognitive principles when designing UI/UX. Use this skill when creating interfaces, forms, navigation, or evaluating user experience. Covers 30 laws from lawsofux.com with implementation guidance.
---

# UX Laws Skill

Reference: https://lawsofux.com/

## HEURISTICS & PRINCIPLES

### Aesthetic-Usability Effect
- Beautiful design perceived as more usable
- Visual appeal creates positive response → tolerance for minor issues
- **Apply**: Invest in visual polish, users forgive issues in attractive UIs

### Jakob's Law
- Users expect your site to work like others they know
- Leverage existing mental models
- **Apply**: Follow platform conventions, don't reinvent navigation

### Occam's Razor
- Simplest solution with fewest assumptions is best
- Remove unnecessary elements
- **Apply**: Question every element — if removal doesn't hurt, remove it

### Postel's Law (Robustness Principle)
- Be liberal in what you accept, conservative in what you send
- Flexible input, strict output
- **Apply**: Accept various date formats, phone formats; normalize internally

### Tesler's Law (Conservation of Complexity)
- Every system has irreducible complexity
- Decide who bears it: user or system
- **Apply**: Hide complexity in system, not user's burden

## COGNITIVE LOAD

### Cognitive Load
- Mental resources needed to understand interface
- 3 types: intrinsic (task), extraneous (design), germane (learning)
- **Apply**: Minimize extraneous load, support intrinsic with good design

### Miller's Law (7±2)
- Working memory holds ~7 items
- Chunk information into groups
- **Apply**: Limit nav items to 5-7, use progressive disclosure

### Chunking
- Group related info into meaningful wholes
- Phone numbers: 555-123-4567 not 5551234567
- **Apply**: Chunk forms, use visual grouping, break long lists

### Working Memory
- Temporary cognitive storage
- Limited capacity, easily disrupted
- **Apply**: Don't require memorization across screens

## DECISION MAKING

### Hick's Law
- Decision time increases with number/complexity of choices
- T = a + b·log2(n)
- **Apply**: Limit options, use progressive disclosure, smart defaults

### Choice Overload (Paradox of Choice)
- Too many options → paralysis, regret, dissatisfaction
- 6 jams vs 24 jams study
- **Apply**: Curate options, recommend defaults, allow filtering

### Cognitive Bias
- Systematic thinking errors affecting judgment
- Confirmation bias, anchoring, availability heuristic
- **Apply**: Present balanced info, avoid dark patterns

## ATTENTION & MEMORY

### Selective Attention
- Focus on goal-relevant stimuli only
- Inattentional blindness (gorilla experiment)
- **Apply**: Make important elements prominent, reduce visual noise

### Von Restorff Effect (Isolation Effect)
- Different item among similar ones is remembered
- **Apply**: Make CTAs visually distinct, highlight key info

### Serial Position Effect
- First (primacy) and last (recency) items remembered best
- **Apply**: Put important items first/last in lists, menus

### Peak-End Rule
- Experience judged by peak moment + ending
- **Apply**: End flows positively, celebrate completion

### Zeigarnik Effect
- Incomplete tasks remembered better than completed
- **Apply**: Progress indicators, save partial work, resume states

## VISUAL PERCEPTION (Gestalt)

### Law of Proximity
- Near objects grouped together
- **Apply**: Group related controls, use whitespace to separate

### Law of Similarity
- Similar elements perceived as group
- **Apply**: Consistent styling for same-type elements

### Law of Common Region
- Shared boundary = group
- **Apply**: Use cards, panels, borders to group content

### Law of Uniform Connectedness
- Visually connected = related
- **Apply**: Lines, arrows, flows to show relationships

### Law of Prägnanz (Simplicity)
- Brain prefers simplest interpretation
- **Apply**: Use clear, simple shapes and layouts

## INTERACTION

### Fitts's Law
- T = a + b·log2(D/W + 1)
- Time to reach target depends on distance/size
- **Apply**: Make clickable areas large, place actions near focus

### Doherty Threshold (<400ms)
- Response > 400ms breaks flow
- Productivity requires <400ms feedback
- **Apply**: Instant visual feedback, skeleton loaders, optimistic UI

### Flow State
- Full immersion in activity
- Balance challenge/skill, clear goals, immediate feedback
- **Apply**: Remove distractions, show progress, maintain momentum

### Goal-Gradient Effect
- Motivation increases near goal
- **Apply**: Show progress, especially near completion (80%→100%)

## USER BEHAVIOR

### Paradox of the Active User
- Users never read manuals, dive in immediately
- Learning by doing, not reading
- **Apply**: Inline help, progressive onboarding, forgiving design

### Pareto Principle (80/20)
- 80% effects from 20% causes
- **Apply**: Focus on most-used features, optimize critical paths

### Parkinson's Law
- Work expands to fill available time
- **Apply**: Set clear deadlines, constrain scope, time limits

### Mental Model
- User's internal representation of how system works
- May differ from actual system model
- **Apply**: Match user expectations, use familiar patterns

---

## APPLICATION CHECKLIST

```
□ Navigation follows Jakob's Law (familiar patterns)
□ Options limited per Hick's Law (5-7 max)
□ Information chunked per Miller's Law
□ Touch targets ≥44px (Fitts's Law)
□ Response time <400ms (Doherty Threshold)
□ Progress shown (Goal-Gradient, Zeigarnik)
□ Important items first/last (Serial Position)
□ CTAs visually distinct (Von Restorff)
□ Related items grouped (Gestalt laws)
□ Complexity handled by system (Tesler's Law)
□ Input flexible (Postel's Law)
□ Design aesthetically pleasing (Aesthetic-Usability)
```

## REFERENCES

- Laws of UX: https://lawsofux.com/
- Nielsen Norman Group: https://www.nngroup.com/
- Don Norman: The Design of Everyday Things
- Steve Krug: Don't Make Me Think
