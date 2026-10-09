# Dots artwork

The website explains the five Hub actor types. Fink is an agent (AI model),
Bruno a watcher (scheduled checks, no model), Kalle a script (fixed task, no
model), Luma a test (defined checks with a final result), and the human decides
and approves. The character SVGs retain the Hub silhouettes, palette, faces
and role accessories. The human uses a neutral person symbol rather than a
Dot. The German and English homepages embed the artwork with unique SVG
identifiers per character and placement, including the actor explanations.

Only the artwork is included here. The Hub application renderer, agent settings
and operational data are not part of these assets. The fine felt displacement
filter is omitted for small, predictable web rendering.

`dots.css` animates the embedded SVG parts and an illustrative handoff from
watcher to agent to script to test to human for 4.8 seconds once the scene
enters view. Each explanatory portrait also plays a 3.2-second action once:
Fink writes, Bruno checks the clock, Kalle uses a tool, Luma checks the result,
and the human nods and approves. Gentle swaying and occasional blinking keep
the characters friendly afterwards; Luma adds a small wave and the human nods.
The whole character moves together above a softly changing ground shadow.
Text and names stay still. Two synchronized pause/resume controls apply to all
figures. `dots.js` starts each portrait independently and pauses scenes outside
the viewport and in hidden tabs. Reduced motion and disabled JavaScript show
the same readable static poses and hide the motion controls. The scene represents an example, not live
agent activity.
