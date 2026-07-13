# Kindwerley Premium Sky v3

Clean GitHub Pages repository for `kindwerley.com`.

## Upload correctly

1. Extract the ZIP on your computer.
2. In the GitHub repository, delete the old website files.
3. Upload **all files and the complete `assets` folder** from inside this package to the repository root.
4. Confirm that `index.html`, `style.css`, `sky.js`, `CNAME` and `assets/sky/...` appear at the same repository level.
5. Wait for GitHub Pages / Cloudflare to deploy, then open the site in a private window.

Do not upload the ZIP itself and do not place the extracted folder inside another folder.

## Testing scenes

- `/?scene=dawn`
- `/?scene=day`
- `/?scene=golden`
- `/?scene=dusk`
- `/?scene=night`

Testing exact local times:

- `/?time=06:00`
- `/?time=12:00`
- `/?time=18:30`
- `/?time=23:00`

Remove the query parameter for normal automatic operation.

## Important

This version intentionally removes the artificial weather effects. It uses five photographic backgrounds and smooth time-based transitions. The asset names and cache-busting version are new so browsers do not keep the broken previous background.
