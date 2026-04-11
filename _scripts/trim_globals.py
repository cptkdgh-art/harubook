"""globals.css에서 library 섹션 전체 제거."""
from pathlib import Path

p = Path(r'D:/바이브랩스_2주차_투두앱/harubook/src/app/globals.css')
content = p.read_text(encoding='utf-8')

# library 섹션 시작: "/* 하루나무 — 서재: 네온 와이어프레임 */"
start_marker = '/* 하루나무 — 서재: 네온 와이어프레임 */'
idx = content.find(start_marker)
if idx == -1:
    raise SystemExit('start marker not found')

# 파일 끝까지 전부 제거
trimmed = content[:idx].rstrip() + '\n'

p.write_text(trimmed, encoding='utf-8')
print(f'trimmed. new length: {len(trimmed)}')
