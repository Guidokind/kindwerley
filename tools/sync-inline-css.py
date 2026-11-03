"""Run after editing style.css to update the six generated inline styles."""
from pathlib import Path
import re
root = Path(__file__).resolve().parents[1]
css = (root / "style.css").read_text()
css = re.sub(r"/\*[\s\S]*?\*/", "", css)
css = re.sub(r"\s+", " ", css).strip()
for name in ("index.html", "es/index.html", "pt/index.html", "fr/index.html", "it/index.html", "privacy.html"):
    path = root / name
    text, count = re.subn(r'<style id="site-styles">[\s\S]*?</style>', lambda _: '<style id="site-styles">' + css + '</style>', path.read_text())
    if count != 1:
        raise ValueError(f"Expected one generated style block in {name}")
    path.write_text(text)
