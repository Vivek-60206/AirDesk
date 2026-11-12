from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
HTML_FILE = ROOT / "index.html"


class SiteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.local_assets: list[str] = []
        self.local_anchors: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if element_id := values.get("id"):
            self.ids.append(element_id)

        asset_key = "src" if tag == "script" else "href" if tag == "link" else None
        if asset_key and (asset := values.get(asset_key)):
            parts = urlsplit(asset)
            if not parts.scheme and not parts.netloc and not asset.startswith("#"):
                self.local_assets.append(parts.path)

        href = values.get("href")
        if href and href.startswith("#"):
            self.local_anchors.append(href[1:])


def main() -> None:
    parser = SiteParser()
    parser.feed(HTML_FILE.read_text(encoding="utf-8-sig"))
    parser.close()

    if len(parser.ids) != len(set(parser.ids)):
        raise SystemExit("Duplicate HTML id found.")

    missing_assets = [path for path in parser.local_assets if not (ROOT / path).is_file()]
    if missing_assets:
        raise SystemExit(f"Missing local assets: {', '.join(missing_assets)}")

    ids = set(parser.ids)
    missing_anchors = [anchor for anchor in parser.local_anchors if anchor not in ids]
    if missing_anchors:
        raise SystemExit(f"Broken local anchors: {', '.join(missing_anchors)}")

    for required_id in ("live-demo", "camera-start", "camera-stop", "gesture-playground"):
        if required_id not in ids:
            raise SystemExit(f"Required demo element is missing: {required_id}")

    print(
        f"Site check passed: {len(ids)} unique IDs, "
        f"{len(parser.local_assets)} local assets, "
        f"{len(parser.local_anchors)} valid page anchors."
    )


if __name__ == "__main__":
    main()
