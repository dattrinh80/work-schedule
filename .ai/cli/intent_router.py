#!/usr/bin/env python3
from __future__ import annotations
import argparse, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
AI=ROOT/".ai"

ROUTES=[
 ("bootstrap", [r"\bbootstrap\b", r"\binitialize project\b", r"\bstart project from prd\b", r"khởi tạo dự án"]),
 ("feature", [r"\bbuild feature\b", r"\badd feature\b", r"\bimplement feature\b", r"tính năng"]),
 ("bugfix", [r"\bfix bug\b", r"\brepair bug\b", r"sửa lỗi"]),
 ("resume", [r"\bresume project\b", r"\bcontinue task\b", r"tiếp tục dự án"]),
 ("verify", [r"\bverify project\b", r"\brun verification\b", r"kiểm tra dự án"]),
 ("status", [r"\bproject status\b", r"\bharness status\b", r"trạng thái dự án"]),
 ("release", [r"\bprepare release\b", r"chuẩn bị phát hành"]),
 ("audit", [r"\baudit harness\b", r"kiểm tra harness"]),
]

def resolve(text):
    s=text.strip().lower()
    for name,patterns in ROUTES:
        if any(re.search(p,s) for p in patterns):
            return name
    return None

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("text", nargs="+")
    a=ap.parse_args()
    text=" ".join(a.text)
    route=resolve(text)
    if not route:
        print("NO_MATCH")
        return 2
    print(route)
    print(AI/"intents"/f"{route}.md")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
