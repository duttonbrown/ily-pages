"""Replace inline bottle SVGs with new well-proportioned versions across all v2/v3/v4 HTMLs.
Now uses the ACTUAL wordmark SVG (via <image href>) inside each label, replacing the typed
'iloveyouth.' text that was overflowing on narrow labels."""

import re
from pathlib import Path

# Constant: the real wordmark image, sized to sit comfortably inside the label.
# Wordmark intrinsic aspect = 985.093 / 355.276 ≈ 2.773, so at width=34 units, height ≈ 12.3 → 13.
# placed in the TOP portion of the label, with the product name + spec below.
WORDMARK = '<image href="assets/ily-wordmark-dark.svg" x="33" y="96" width="34" height="13" preserveAspectRatio="xMidYMid meet"/>'
WORDMARK_MOIST = '<image href="assets/ily-wordmark-dark.svg" x="32" y="96" width="36" height="13" preserveAspectRatio="xMidYMid meet"/>'
WORDMARK_EYE = '<image href="assets/ily-wordmark-dark.svg" x="36" y="92" width="28" height="11" preserveAspectRatio="xMidYMid meet"/>'

BOTTLES = {
    "cleanser": f'''<svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMid meet">
                <rect x="20" y="32" width="60" height="148" rx="8" fill="#2a2220"/>
                <rect x="32" y="14" width="36" height="22" rx="3" fill="#2a2220"/>
                <rect x="25" y="86" width="50" height="64" rx="2" fill="#f0f3fa"/>
                {WORDMARK}
                <text x="50" y="126" text-anchor="middle" fill="#2a2220" font-family="Satoshi, sans-serif" font-size="4.5" letter-spacing="0.6" font-weight="400">cleanser</text>
                <text x="50" y="140" text-anchor="middle" fill="#6b5c54" font-family="Satoshi, sans-serif" font-size="2.8" letter-spacing="0.6" font-weight="500">step 01 · 150ml</text>
              </svg>''',
    "toner": f'''<svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMid meet">
                <rect x="20" y="32" width="60" height="148" rx="8" fill="#2a2220"/>
                <rect x="32" y="14" width="36" height="22" rx="3" fill="#2a2220"/>
                <rect x="25" y="86" width="50" height="64" rx="2" fill="#f0f3fa"/>
                {WORDMARK}
                <text x="50" y="126" text-anchor="middle" fill="#2a2220" font-family="Satoshi, sans-serif" font-size="4.5" letter-spacing="0.6" font-weight="400">toner</text>
                <text x="50" y="140" text-anchor="middle" fill="#6b5c54" font-family="Satoshi, sans-serif" font-size="2.8" letter-spacing="0.6" font-weight="500">step 02 · 200ml</text>
              </svg>''',
    "serum": f'''<svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMid meet">
                <rect x="20" y="32" width="60" height="148" rx="8" fill="#2a2220"/>
                <rect x="32" y="14" width="36" height="22" rx="3" fill="#2a2220"/>
                <line x1="50" y1="36" x2="50" y2="68" stroke="#2a2220" stroke-width="3"/>
                <rect x="25" y="86" width="50" height="64" rx="2" fill="#f0f3fa"/>
                {WORDMARK}
                <text x="50" y="126" text-anchor="middle" fill="#2a2220" font-family="Satoshi, sans-serif" font-size="4" letter-spacing="0.5" font-weight="400">hydration serum</text>
                <text x="50" y="140" text-anchor="middle" fill="#6b5c54" font-family="Satoshi, sans-serif" font-size="2.6" letter-spacing="0.5" font-weight="500">5% niacinamide · 30ml</text>
              </svg>''',
    "moisturizer": f'''<svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMid meet">
                <ellipse cx="50" cy="42" rx="34" ry="14" fill="#2a2220"/>
                <rect x="16" y="42" width="68" height="124" rx="34" fill="#2a2220"/>
                <rect x="22" y="86" width="56" height="60" rx="2" fill="#f0f3fa"/>
                {WORDMARK_MOIST}
                <text x="50" y="124" text-anchor="middle" fill="#2a2220" font-family="Satoshi, sans-serif" font-size="4" letter-spacing="0.5" font-weight="400">daily moisturizer</text>
                <text x="50" y="138" text-anchor="middle" fill="#6b5c54" font-family="Satoshi, sans-serif" font-size="2.7" letter-spacing="0.5" font-weight="500">ceramides · 50ml</text>
              </svg>''',
    "eye": f'''<svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMid meet">
                <ellipse cx="50" cy="46" rx="22" ry="8" fill="#1a1414"/>
                <rect x="28" y="46" width="44" height="118" rx="22" fill="#1a1414"/>
                <rect x="32" y="80" width="36" height="58" rx="2" fill="#ade8f9"/>
                {WORDMARK_EYE}
                <text x="50" y="116" text-anchor="middle" fill="#2a2220" font-family="Satoshi, sans-serif" font-size="3.5" letter-spacing="0.5" font-weight="400">eye cream</text>
                <text x="50" y="128" text-anchor="middle" fill="#52453f" font-family="Satoshi, sans-serif" font-size="2.4" letter-spacing="0.5" font-weight="500">15ml</text>
              </svg>''',
    "niacinamide": f'''<svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMid meet">
                <rect x="20" y="32" width="60" height="148" rx="8" fill="#2a2220"/>
                <rect x="32" y="14" width="36" height="22" rx="3" fill="#2a2220"/>
                <line x1="50" y1="36" x2="50" y2="68" stroke="#2a2220" stroke-width="3"/>
                <rect x="25" y="86" width="50" height="64" rx="2" fill="#f0f3fa"/>
                {WORDMARK}
                <text x="50" y="126" text-anchor="middle" fill="#2a2220" font-family="Satoshi, sans-serif" font-size="4" letter-spacing="0.5" font-weight="400">niacinamide</text>
                <text x="50" y="140" text-anchor="middle" fill="#6b5c54" font-family="Satoshi, sans-serif" font-size="2.8" letter-spacing="0.6" font-weight="500">5% · vitamin b3</text>
              </svg>''',
    "ceramides": f'''<svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMid meet">
                <ellipse cx="50" cy="42" rx="34" ry="14" fill="#2a2220"/>
                <rect x="16" y="42" width="68" height="124" rx="34" fill="#2a2220"/>
                <rect x="22" y="86" width="56" height="60" rx="2" fill="#f0f3fa"/>
                {WORDMARK_MOIST}
                <text x="50" y="124" text-anchor="middle" fill="#2a2220" font-family="Satoshi, sans-serif" font-size="4.2" letter-spacing="0.5" font-weight="400">ceramides</text>
                <text x="50" y="138" text-anchor="middle" fill="#6b5c54" font-family="Satoshi, sans-serif" font-size="2.8" letter-spacing="0.6" font-weight="500">np · ap · eop</text>
              </svg>''',
    "hyaluronic": f'''<svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMid meet">
                <rect x="20" y="32" width="60" height="148" rx="8" fill="#1a1414"/>
                <rect x="32" y="14" width="36" height="22" rx="3" fill="#1a1414"/>
                <rect x="25" y="86" width="50" height="64" rx="2" fill="#ade8f9"/>
                {WORDMARK}
                <text x="50" y="126" text-anchor="middle" fill="#2a2220" font-family="Satoshi, sans-serif" font-size="3.7" letter-spacing="0.4" font-weight="400">hyaluronic acid</text>
                <text x="50" y="140" text-anchor="middle" fill="#52453f" font-family="Satoshi, sans-serif" font-size="2.7" letter-spacing="0.5" font-weight="500">multi-weight</text>
              </svg>''',
}

SVG_RE = re.compile(r'<svg\s+viewBox="0 0 100 200"[^>]*>.*?</svg>', re.DOTALL)

def detect_bottle_kind(block: str) -> str | None:
    inner = block.lower()
    if 'hydration serum' in inner or '5% niacinamide · 30ml' in inner:
        return 'serum'
    if '>niacinamide<' in inner or 'niacinamide</text>' in inner or '5% · vitamin' in inner:
        return 'niacinamide'
    if 'hyaluronic acid' in inner:
        return 'hyaluronic'
    if 'ceramides' in inner and 'serum' not in inner:
        return 'ceramides'
    if '>moisturizer<' in inner or 'daily moisturizer' in inner or 'ceramides · 50ml' in inner:
        return 'moisturizer'
    if '>cleanser<' in inner or 'step 01 · 150ml' in inner:
        return 'cleanser'
    if '>toner<' in inner or 'step 02 · 200ml' in inner:
        return 'toner'
    if '>eye<' in inner or 'eye cream' in inner or '>15ml<' in inner:
        return 'eye'
    return None

def replace_bottles_in(content: str, filename: str):
    matches = list(SVG_RE.finditer(content))
    if not matches:
        return content, 0
    out, last, replaced = [], 0, 0
    for m in matches:
        block = m.group(0)
        kind = detect_bottle_kind(block)
        out.append(content[last:m.start()])
        if kind and kind in BOTTLES:
            out.append(BOTTLES[kind])
            replaced += 1
        else:
            out.append(block)
        last = m.end()
    out.append(content[last:])
    return ''.join(out), replaced

total = 0
for f in sorted(Path('.').glob('v[2-4]*.html')):
    s = f.read_text()
    s2, n = replace_bottles_in(s, f.name)
    if n:
        f.write_text(s2)
        print(f"  {f.name}: replaced {n} bottle(s)")
        total += n
print(f"total bottle replacements: {total}")
