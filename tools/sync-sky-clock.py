"""Regenerate the inline solar clock after editing sky-clock.js."""
from pathlib import Path
import re
root = Path(__file__).resolve().parents[1]
source = re.sub(r'/\*[\s\S]*?\*/', '', (root/'sky-clock.js').read_text()).strip()
for name in ['index.html','es/index.html','pt/index.html','fr/index.html','it/index.html','privacy.html']:
    path = root/name
    text, count = re.subn(r'<script id="sky-clock">[\s\S]*?</script>', lambda _: '<script id="sky-clock">'+source+'</script>', path.read_text())
    if count != 1:
        raise ValueError('Expected one clock in '+name)
    path.write_text(text)
