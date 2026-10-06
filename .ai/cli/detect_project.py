#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

try:
    import yaml
except ImportError as exc:
    print("Missing PyYAML. Run: pip install -r .ai/cli/requirements.txt", file=sys.stderr)
    raise SystemExit(2) from exc

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / ".ai" / "runtime" / "bootstrap"

def read_json(path: Path) -> Dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}

def exists_any(names: List[str], base: Path = ROOT) -> bool:
    return any((base / n).exists() for n in names)

def detect_package_manager(base: Path = ROOT) -> Optional[str]:
    if (base / "pnpm-lock.yaml").exists():
        return "pnpm"
    if (base / "yarn.lock").exists():
        return "yarn"
    if (base / "bun.lockb").exists() or (base / "bun.lock").exists():
        return "bun"
    if (base / "package-lock.json").exists():
        return "npm"
    if (base / "package.json").exists():
        pkg = read_json(base / "package.json")
        pm = pkg.get("packageManager")
        if isinstance(pm, str) and "@" in pm:
            return pm.split("@",1)[0]
        return "npm"
    return None

def dependency_names(pkg: Dict[str, Any]) -> set[str]:
    names = set()
    for key in ("dependencies","devDependencies","peerDependencies"):
        obj = pkg.get(key, {})
        if isinstance(obj, dict):
            names.update(obj.keys())
    return names

def detect_js_framework(base: Path) -> Optional[str]:
    pkg_path = base / "package.json"
    if not pkg_path.exists():
        return None
    pkg = read_json(pkg_path)
    deps = dependency_names(pkg)
    if "next" in deps:
        return "nextjs"
    if "@nestjs/core" in deps:
        return "nestjs"
    if "vite" in deps and ("react" in deps or "@vitejs/plugin-react" in deps):
        return "vite-react"
    if "react" in deps:
        return "react"
    if "express" in deps:
        return "express"
    return "node"

def detect_php(base: Path) -> Optional[str]:
    composer = base / "composer.json"
    if not composer.exists():
        return None
    data = read_json(composer)
    req = {}
    req.update(data.get("require", {}) if isinstance(data.get("require"), dict) else {})
    req.update(data.get("require-dev", {}) if isinstance(data.get("require-dev"), dict) else {})
    if "laravel/framework" in req:
        return "laravel"
    return "php"

def detect_python(base: Path) -> Optional[str]:
    if exists_any(["pyproject.toml","requirements.txt","Pipfile","poetry.lock"], base):
        return "python"
    return None

def detect_monorepo() -> Tuple[str, List[Path]]:
    roots: List[Path] = []
    if (ROOT / "pnpm-workspace.yaml").exists():
        return "monorepo", roots
    pkg = read_json(ROOT / "package.json") if (ROOT / "package.json").exists() else {}
    if "workspaces" in pkg:
        return "monorepo", roots
    if (ROOT / "turbo.json").exists() or (ROOT / "nx.json").exists():
        return "monorepo", roots
    if (ROOT / "apps").is_dir() or (ROOT / "packages").is_dir():
        return "monorepo", roots
    return "single-app", roots

def child_candidates() -> List[Path]:
    result = []
    for parent_name in ["apps","packages","services","frontend","backend"]:
        parent = ROOT / parent_name
        if parent.is_dir():
            for child in parent.iterdir():
                if child.is_dir():
                    result.append(child)
    result.append(ROOT)
    uniq = []
    seen = set()
    for p in result:
        rp = p.resolve()
        if rp not in seen:
            seen.add(rp); uniq.append(p)
    return uniq

def rel(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT)).replace("\\","/") or "."
    except Exception:
        return str(path)

def detect_stacks() -> Dict[str, Any]:
    frontend = None
    backend = None
    others = []
    for base in child_candidates():
        js = detect_js_framework(base)
        php = detect_php(base)
        py = detect_python(base)

        if js in {"nextjs","vite-react","react"} and frontend is None:
            frontend = {"framework": js, "root": rel(base)}
        elif js in {"nestjs","express","node"} and backend is None:
            backend = {"framework": js, "root": rel(base)}
        elif php and backend is None:
            backend = {"framework": php, "root": rel(base)}
        elif py and backend is None:
            backend = {"framework": py, "root": rel(base)}
        elif any([js, php, py]):
            others.append({"framework": js or php or py, "root": rel(base)})

    out = {}
    if frontend: out["frontend"] = frontend
    if backend: out["backend"] = backend
    if others: out["other"] = others
    return out

def grep_text(patterns: List[str]) -> bool:
    candidates = [
        ROOT / "docker-compose.yml", ROOT / "docker-compose.yaml",
        ROOT / "compose.yml", ROOT / "compose.yaml",
        ROOT / ".env.example", ROOT / "README.md"
    ]
    text = ""
    for p in candidates:
        if p.exists() and p.is_file():
            try:
                text += "\n" + p.read_text(encoding="utf-8", errors="ignore").lower()
            except Exception:
                pass
    return any(p.lower() in text for p in patterns)

def detect_datastores() -> List[str]:
    stores = []
    if grep_text(["postgres","postgresql"]):
        stores.append("postgres")
    if grep_text(["mysql","mariadb"]):
        stores.append("mysql")
    if grep_text(["redis"]):
        stores.append("redis")
    if grep_text(["sqlite"]):
        stores.append("sqlite")
    return stores

def package_scripts(base: Path) -> Dict[str, str]:
    pkg_path = base / "package.json"
    if not pkg_path.exists():
        return {}
    pkg = read_json(pkg_path)
    scripts = pkg.get("scripts", {})
    return scripts if isinstance(scripts, dict) else {}

def pm_exec(pm: str, script: str) -> str:
    if pm == "npm":
        return f"npm run {script}"
    return f"{pm} {script}"

def detect_commands(pm: Optional[str]) -> Dict[str, str]:
    commands = {k:"" for k in ["install","build","lint","typecheck","test","contract_test","architecture_test","ui_test"]}
    if not pm:
        # Laravel/Python fallbacks
        if (ROOT / "artisan").exists():
            commands["test"] = "php artisan test"
        elif (ROOT / "pytest.ini").exists() or (ROOT / "pyproject.toml").exists():
            commands["test"] = "pytest"
        return commands

    commands["install"] = {
        "npm":"npm ci" if (ROOT/"package-lock.json").exists() else "npm install",
        "pnpm":"pnpm install --frozen-lockfile",
        "yarn":"yarn install --immutable",
        "bun":"bun install --frozen-lockfile",
    }.get(pm, "")

    scripts = package_scripts(ROOT)
    aliases = {
        "build":["build"],
        "lint":["lint"],
        "typecheck":["typecheck","type-check","check:types"],
        "test":["test","test:unit"],
        "contract_test":["test:contract","contract:test"],
        "architecture_test":["test:architecture","architecture:test"],
        "ui_test":["test:ui","test:e2e","e2e"],
    }
    for target, names in aliases.items():
        for name in names:
            if name in scripts:
                commands[target] = pm_exec(pm, name)
                break
    return commands

def make_profile() -> Dict[str, Any]:
    project_type, _ = detect_monorepo()
    pm = detect_package_manager()
    profile = {
        "project":{
            "type": project_type,
            "package_manager": pm,
        },
        "stacks": detect_stacks(),
        "datastores": detect_datastores(),
        "tooling":{
            "docker": (ROOT/"Dockerfile").exists() or any(ROOT.glob("**/Dockerfile")),
            "compose": exists_any(["docker-compose.yml","docker-compose.yaml","compose.yml","compose.yaml"]),
            "turbo": (ROOT/"turbo.json").exists(),
            "nx": (ROOT/"nx.json").exists(),
        },
        "commands": detect_commands(pm),
    }
    return profile

def report(profile: Dict[str, Any]) -> str:
    lines = ["# Project Detection Report", ""]
    p = profile["project"]
    lines += [f"- Project type: `{p.get('type')}`", f"- Package manager: `{p.get('package_manager')}`", ""]
    lines.append("## Stacks")
    if profile["stacks"]:
        for role, item in profile["stacks"].items():
            lines.append(f"- {role}: `{item}`")
    else:
        lines.append("- No application stack confidently detected.")
    lines += ["", "## Datastores"]
    if profile["datastores"]:
        for d in profile["datastores"]:
            lines.append(f"- {d}")
    else:
        lines.append("- None detected from conservative repository signals.")
    lines += ["", "## Proposed commands"]
    for k,v in profile["commands"].items():
        lines.append(f"- {k}: `{v or 'NOT_CONFIGURED'}`")
    lines += ["", "## Important", "Generated commands are proposals. Review before merging into `.ai/harness/project-commands.yaml`."]
    return "\n".join(lines) + "\n"

def main() -> int:
    profile = make_profile()
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT/"project-profile.yaml").write_text(
        yaml.safe_dump(profile, sort_keys=False, allow_unicode=True), encoding="utf-8"
    )
    (OUT/"detection-report.md").write_text(report(profile), encoding="utf-8")
    generated = {"commands": profile["commands"]}
    (ROOT/".ai/harness/project-commands.generated.yaml").write_text(
        yaml.safe_dump(generated, sort_keys=False, allow_unicode=True), encoding="utf-8"
    )
    print("Detected project profile:")
    print(yaml.safe_dump(profile, sort_keys=False, allow_unicode=True))
    print("Generated:")
    print("- .ai/runtime/bootstrap/project-profile.yaml")
    print("- .ai/runtime/bootstrap/detection-report.md")
    print("- .ai/harness/project-commands.generated.yaml")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
